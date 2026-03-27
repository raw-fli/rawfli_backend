import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { createError, ErrorCode } from 'src/common/exception/error';
import { CreatePostDto, CreatePostPhotoDto } from 'src/domain/post/dto/create-post.dto';
import { DeletedPostResponseDto } from 'src/domain/post/dto/deleted-post.response.dto';
import { PostListItemResponseDto, PostListResponseDto, PostResponseDto } from 'src/domain/post/dto/post.response.dto';
import { Image } from 'src/domain/aws/entity/image.entity';
import { Photo } from 'src/common/entities/photo.entity';
import { Post } from 'src/domain/post/entity/post.entity';
import { DeletedPost } from 'src/domain/post/entity/deleted-post.entity';
import { DecodedUserToken, User } from 'src/domain/user/entity/user.entity';
import { CamerasService } from 'src/domain/camera/camera.service';
import { LensesService } from 'src/domain/lens/lens.service';
import { DataSource, Repository } from 'typeorm';
import { Comment } from 'src/common/entities/comment.entity';
import { CreateCommentDto } from 'src/common/dtos/create-comment.dto';
import { CommentResponseDto } from 'src/common/dtos/comment.response.dto';
import { DeletedCommentResponseDto } from 'src/common/dtos/deleted-comment.response.dto';
import { DeletedComment } from 'src/common/entities/deleted-comment.entity';
import { parseShutterSpeed, sanitizeExifString } from 'src/common/utils/exif.utils';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Photo) private readonly photoRepository: Repository<Photo>,
    @InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
    private readonly camerasService: CamerasService,
    private readonly lensesService: LensesService,
    private readonly dataSource: DataSource,
  ) { }

  private resolveThumbnailKey(post: Post): string | null {
    const coverPhotoId = post.coverPhoto?.id;
    if (coverPhotoId) {
      const matchedCover = post.photos?.find((photo) => photo.id === coverPhotoId);
      if (matchedCover?.image?.key) {
        return matchedCover.image.key;
      }
      if (post.coverPhoto?.image?.key) {
        return post.coverPhoto.image.key;
      }
    }

    return post.photos?.[0]?.image?.key ?? null;
  }

  private toCreatePhotoInputs(dto: CreatePostDto): CreatePostPhotoDto[] {
    if (dto.photos?.length) {
      return dto.photos;
    }

    const imageIds = dto.imageIds ?? [];
    return imageIds.map((imageId, index) => ({
      imageId,
      description: dto.photoDescriptions?.[index],
    }));
  }

  async createPost(user: DecodedUserToken, dto: CreatePostDto): Promise<PostResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const post = new Post();
      post.author = { id: user.id } as User;
      post.title = dto.title;
      post.content = dto.content;
      const savedPost = await manager.save(Post, post);

      const photoInputs = this.toCreatePhotoInputs(dto);

      if (photoInputs.length > 0) {
        const uniqueImageIds = [...new Set(photoInputs.map((input) => input.imageId))];
        const images = await manager
          .createQueryBuilder(Image, 'image')
          .innerJoin('image.uploader', 'uploader')
          .where('image.id IN (:...ids)', { ids: uniqueImageIds })
          .andWhere('uploader.id = :userId', { userId: user.id })
          .getMany();

        if (images.length !== uniqueImageIds.length) {
          throw new BadRequestException('본인이 업로드한 이미지만 작품으로 추가할 수 있어요.');
        }

        const imageMap = new Map(images.map((image) => [image.id, image]));
        const photos: Photo[] = [];

        for (const input of photoInputs) {
          const image = imageMap.get(input.imageId);
          if (!image) continue;

          const photo = new Photo();
          photo.image = image;
          photo.post = savedPost;
          photo.author = { id: user.id } as User;

          const rawDescription = typeof input.description === 'string' ? input.description.trim() : undefined;
          photo.description = rawDescription ? rawDescription : undefined;

          if (image.exifData) {
            const exif = image.exifData;
            photo.iso = exif.iso ?? null;
            photo.aperture = exif.aperture ?? null;
            photo.shutterSpeedDisplay = exif.shutterSpeedDisplay ?? null;
            photo.shutterSpeedValue = exif.shutterSpeedValue ?? null;
            photo.focalLength = exif.focalLength ?? null;

            if (exif.cameraModel) {
              photo.camera = await this.camerasService.findOrCreateByExif(
                exif.cameraModel,
                exif.cameraMake,
                manager,
              );
            }

            if (exif.lensModel) {
              photo.lens = await this.lensesService.findOrCreateByExif(
                exif.lensModel,
                exif.lensMake,
                manager,
              );
            }
          } else {
            photo.iso = null;
            photo.aperture = null;
            photo.shutterSpeedDisplay = null;
            photo.shutterSpeedValue = null;
            photo.focalLength = null;
            photo.camera = null;
            photo.lens = null;
          }

          if (input.iso !== undefined) {
            photo.iso = input.iso;
          }
          if (input.aperture !== undefined) {
            photo.aperture = input.aperture;
          }
          if (input.focalLength !== undefined) {
            photo.focalLength = input.focalLength;
          }

          if (input.shutterSpeed !== undefined) {
            const normalizedShutter = input.shutterSpeed.trim();
            if (!normalizedShutter) {
              photo.shutterSpeedDisplay = null;
              photo.shutterSpeedValue = null;
            } else {
              const parsed = parseShutterSpeed(normalizedShutter);
              if (parsed) {
                photo.shutterSpeedDisplay = parsed.display;
                photo.shutterSpeedValue = parsed.value;
              } else {
                photo.shutterSpeedDisplay = normalizedShutter;
                photo.shutterSpeedValue = null;
              }
            }
          }

          if (input.cameraModel !== undefined) {
            const normalizedCameraModel = sanitizeExifString(String(input.cameraModel));
            if (!normalizedCameraModel) {
              photo.camera = null;
            } else {
              const normalizedCameraBrand =
                typeof input.cameraBrand === 'string' && input.cameraBrand.trim()
                  ? sanitizeExifString(input.cameraBrand)
                  : null;

              photo.camera = await this.camerasService.findOrCreateByExif(
                normalizedCameraModel,
                normalizedCameraBrand,
                manager,
              );
            }
          }

          if (input.lensModel !== undefined) {
            const normalizedLensModel = sanitizeExifString(String(input.lensModel));
            if (!normalizedLensModel) {
              photo.lens = null;
            } else {
              const normalizedLensBrand =
                typeof input.lensBrand === 'string' && input.lensBrand.trim()
                  ? sanitizeExifString(input.lensBrand)
                  : null;

              photo.lens = await this.lensesService.findOrCreateByExif(
                normalizedLensModel,
                normalizedLensBrand,
                manager,
              );
            }
          }

          photos.push(photo);
        }

        await manager.save(Photo, photos.filter(Boolean) as Photo[]);
      }

      return plainToInstance(PostResponseDto, savedPost, { excludeExtraneousValues: true });
    });
  }

  async getPosts(page: number = 1, limit: number = 20): Promise<PostListResponseDto> {
    const [posts, total] = await this.postRepository.findAndCount({
      relations: ['author', 'photos', 'photos.image', 'coverPhoto', 'coverPhoto.image'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = posts.map((post) => {
      const dto = plainToInstance(PostListItemResponseDto, post, { excludeExtraneousValues: true });
      dto.photoCount = post.photos?.length ?? 0;
      dto.thumbnailKey = this.resolveThumbnailKey(post);
      return dto;
    });

    return plainToInstance(PostListResponseDto, { posts: items, total }, { excludeExtraneousValues: true });
  }

  async getPopularPosts(page: number = 1, limit: number = 20): Promise<PostListResponseDto> {
    /**
     * Score = (total_photo_comments * 2 + unique_commenters + sqrt(photo_count + 1)) / (age_hours + 2)^gravity
     */
    const GRAVITY = 1.8;
    const hnScore = `(
      COALESCE((SELECT SUM(p."commentCount") FROM photo p WHERE p."postId" = post.id), 0) * 2.0
      + COALESCE((
        SELECT COUNT(DISTINCT c."authorId")
        FROM comment c
        INNER JOIN photo p ON c."photoId" = p.id
        WHERE p."postId" = post.id
          AND c."deletedAt" IS NULL
      ), 0)
      + SQRT(
        COALESCE((SELECT COUNT(*) FROM photo p2 WHERE p2."postId" = post.id), 0) + 1
      )
    ) / POW(
      EXTRACT(EPOCH FROM (NOW() - post."createdAt")) / 3600.0 + 2.0,
      ${GRAVITY}
    )`;

    const total = await this.postRepository.count();

    const ranked = await this.postRepository
      .createQueryBuilder('post')
      .select(['post.id'])
      .orderBy(hnScore, 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany<{ post_id: number }>();

    const postIds = ranked.map((r) => r.post_id);

    let posts: Post[] = [];
    if (postIds.length > 0) {
      const postsMap = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.photos', 'photos')
        .leftJoinAndSelect('photos.image', 'photosImage')
        .leftJoinAndSelect('post.coverPhoto', 'coverPhoto')
        .leftJoinAndSelect('coverPhoto.image', 'coverPhotoImage')
        .where('post.id IN (:...ids)', { ids: postIds })
        .getMany();

      const byId = new Map(postsMap.map((post) => [post.id, post]));
      posts = postIds.map((id) => byId.get(id)).filter((post): post is Post => !!post);
    }

    const items = posts.map((post) => {
      const dto = plainToInstance(PostListItemResponseDto, post, { excludeExtraneousValues: true });
      dto.photoCount = post.photos?.length ?? 0;
      dto.thumbnailKey = this.resolveThumbnailKey(post);
      return dto;
    });

    return plainToInstance(PostListResponseDto, { posts: items, total }, { excludeExtraneousValues: true });
  }

  async getPost(postId: number): Promise<PostResponseDto> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['author', 'coverPhoto', 'photos', 'photos.image', 'photos.camera', 'photos.lens', 'photos.comments', 'photos.comments.author'],
    });

    if (!post) {
      throw new NotFoundException(createError(ErrorCode.POST_NOT_FOUND));
    }

    return plainToInstance(PostResponseDto, {
      ...post,
      coverPhotoId: post.coverPhoto?.id ?? null,
      photos: post.photos?.map((photo) => ({
        ...photo,
        imageKey: photo.image?.key,
      })),
    }, { excludeExtraneousValues: true });
  }

  async setPostCoverPhoto(
    user: DecodedUserToken,
    postId: number,
    photoId: string | null,
  ): Promise<PostResponseDto> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['author', 'photos', 'photos.image', 'photos.camera', 'photos.lens', 'photos.comments', 'photos.comments.author', 'coverPhoto'],
    });

    if (!post) {
      throw new NotFoundException(createError(ErrorCode.POST_NOT_FOUND));
    }

    if (post.author.id !== user.id) {
      throw new BadRequestException(createError(ErrorCode.NO_PERMISSION_TO_EDIT));
    }

    if (!photoId) {
      post.coverPhoto = null;
    } else {
      const targetPhoto = post.photos?.find((photo) => photo.id === photoId);
      if (!targetPhoto) {
        throw new NotFoundException(createError(ErrorCode.PHOTO_NOT_FOUND));
      }
      post.coverPhoto = targetPhoto;
    }

    await this.postRepository.save(post);

    return plainToInstance(PostResponseDto, {
      ...post,
      coverPhotoId: post.coverPhoto?.id ?? null,
      photos: post.photos?.map((photo) => ({
        ...photo,
        imageKey: photo.image?.key,
      })),
    }, { excludeExtraneousValues: true });
  }

  async deletePost(user: DecodedUserToken, postId: number): Promise<DeletedPostResponseDto> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(createError(ErrorCode.POST_NOT_FOUND));
    }

    if (post.author.id !== user.id) {
      throw new BadRequestException(createError(ErrorCode.NO_PERMISSION_TO_EDIT));
    }

    const deletedPost = new DeletedPost();
    deletedPost.originalPostId = post.id;
    deletedPost.authorId = post.author.id;
    deletedPost.title = post.title;
    deletedPost.content = post.content;
    deletedPost.views = 0;
    deletedPost.originalCreatedAt = post.createdAt as Date;

    const saved = await this.dataSource.transaction(async (manager) => {
      const result = await manager.save(DeletedPost, deletedPost);
      await manager.remove(Post, post);
      return result;
    });

    return plainToInstance(DeletedPostResponseDto, saved, { excludeExtraneousValues: true });
  }

  async createPhotoComment(
    user: DecodedUserToken,
    postId: number,
    photoId: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId, post: { id: postId } },
    });

    if (!photo) {
      throw new NotFoundException(createError(ErrorCode.PHOTO_NOT_FOUND));
    }

    const comment = new Comment();
    comment.photo = photo;
    comment.author = { id: user.id } as User;
    comment.content = dto.content;

    if (dto.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: dto.parentId, photo: { id: photoId } },
      });

      if (!parentComment) {
        throw new NotFoundException(createError(ErrorCode.COMMENT_TO_REPLY_NOT_FOUND));
      }

      comment.parent = parentComment;
    }

    await this.commentRepository.save(comment);

    const saved = await this.commentRepository.findOne({
      where: { id: comment.id },
      relations: ['author'],
    });

    photo.commentCount += 1;
    await this.photoRepository.save(photo);

    return plainToInstance(CommentResponseDto, saved, { excludeExtraneousValues: true });
  }

  async deletePhotoComment(
    user: DecodedUserToken,
    postId: number,
    photoId: string,
    commentId: number,
  ): Promise<DeletedCommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, photo: { id: photoId, post: { id: postId } } },
      relations: ['photo', 'photo.post', 'author'],
    });

    if (!comment) {
      throw new NotFoundException(createError(ErrorCode.COMMENT_NOT_FOUND));
    }

    if (comment.author.id !== user.id) {
      throw new BadRequestException(createError(ErrorCode.NO_PERMISSION_TO_EDIT));
    }

    const deletedComment = new DeletedComment();
    deletedComment.originalCommentId = comment.id;
    deletedComment.postId = comment.photo!.post.id;
    deletedComment.boardId = null;
    deletedComment.authorId = comment.author.id;
    deletedComment.content = comment.content;

    const saved = await this.dataSource.transaction(async (manager) => {
      const result = await manager.save(DeletedComment, deletedComment);
      await manager.softRemove(Comment, comment);
      const photo = comment.photo!;
      photo.commentCount = Math.max(0, photo.commentCount - 1);
      await manager.save(Photo, photo);
      return result;
    });

    return plainToInstance(DeletedCommentResponseDto, saved, { excludeExtraneousValues: true });
  }
}
