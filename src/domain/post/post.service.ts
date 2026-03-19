import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { createError, ErrorCode } from 'src/common/exception/error';
import { CreatePostDto } from 'src/domain/post/dto/create-post.dto';
import { DeletedPostResponseDto } from 'src/domain/post/dto/deleted-post.response.dto';
import { PostListItemResponseDto, PostListResponseDto, PostResponseDto } from 'src/domain/post/dto/post.response.dto';
import { Board } from 'src/domain/board/entity/board.entity';
import { Image } from 'src/domain/aws/entity/image.entity';
import { Photo } from 'src/common/entities/photo.entity';
import { Post } from 'src/domain/post/entity/post.entity';
import { DeletedPost } from 'src/common/entities/deleted-post.entity';
import { DecodedUserToken, User } from 'src/domain/user/entity/user.entity';
import { CamerasService } from 'src/domain/camera/camera.service';
import { LensesService } from 'src/domain/lens/lens.service';
import { DataSource, In, Repository } from 'typeorm';
import { Comment } from 'src/common/entities/comment.entity';
import { CreateCommentDto } from 'src/common/dtos/create-comment.dto';
import { CommentResponseDto } from 'src/common/dtos/comment.response.dto';
import { DeletedCommentResponseDto } from 'src/common/dtos/deleted-comment.response.dto';
import { DeletedComment } from 'src/common/entities/deleted-comment.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Board) private readonly boardRepository: Repository<Board>,
    @InjectRepository(Photo) private readonly photoRepository: Repository<Photo>,
    @InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
    private readonly camerasService: CamerasService,
    private readonly lensesService: LensesService,
    private readonly dataSource: DataSource,
  ) { }

  private async validateGalleryBoard(boardId: number): Promise<Board> {
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException(createError(ErrorCode.BOARD_NOT_FOUND));
    }
    if (board.type !== 'gallery') {
      throw new BadRequestException(createError(ErrorCode.BOARD_TYPE_MISMATCH));
    }
    return board;
  }

  async createPost(user: DecodedUserToken, boardId: number, dto: CreatePostDto): Promise<PostResponseDto> {
    const board = await this.validateGalleryBoard(boardId);

    return await this.dataSource.transaction(async (manager) => {
      board.maxPostId += 1;
      await manager.save(Board, board);

      const post = new Post();
      post.id = board.maxPostId;
      post.board = board;
      post.author = { id: user.id } as User;
      post.title = dto.title;
      post.content = dto.content;
      const savedPost = await manager.save(Post, post);

      if (dto.imageIds && dto.imageIds.length > 0) {
        const images = await manager.findBy(Image, { id: In(dto.imageIds) });
        const photos: Photo[] = [];

        for (let index = 0; index < dto.imageIds.length; index += 1) {
          const imageId = dto.imageIds[index];
          const image = images.find((img) => img.id === imageId);
          if (!image) continue;

          const photo = new Photo();
          photo.image = image;
          photo.post = savedPost;
          photo.author = { id: user.id } as User;
          photo.description = dto.photoDescriptions?.[index] ?? undefined;

          if (image.exifData) {
            const exif = image.exifData;
            photo.iso = exif.iso ?? null;
            photo.aperture = exif.aperture ?? null;
            photo.shutterSpeedDisplay = exif.shutterSpeedDisplay ?? null;
            photo.shutterSpeedValue = exif.shutterSpeedValue ?? null;
            photo.focalLength = exif.focalLength ?? null;

            if (exif.cameraModel) {
              photo.camera = await this.camerasService.findOrCreateByExif(
                exif.cameraModel, exif.cameraMake, manager,
              );
            }

            if (exif.lensModel) {
              photo.lens = await this.lensesService.findOrCreateByExif(
                exif.lensModel, exif.lensMake, manager,
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

  async getPosts(boardId: number, page: number = 1, limit: number = 20): Promise<PostListResponseDto> {
    await this.validateGalleryBoard(boardId);

    const [posts, total] = await this.postRepository.findAndCount({
      where: { board: boardId as any },
      relations: ['author', 'photos'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = posts.map((post) => {
      const dto = plainToInstance(PostListItemResponseDto, post, { excludeExtraneousValues: true });
      dto.photoCount = post.photos?.length ?? 0;
      return dto;
    });

    return plainToInstance(PostListResponseDto, { posts: items, total }, { excludeExtraneousValues: true });
  }

  async getPopularPosts(boardId: number, page: number = 1, limit: number = 20): Promise<PostListResponseDto> {
    await this.validateGalleryBoard(boardId);

    /**
     * Score = (total_photo_comments * 2 + unique_commenters + sqrt(photo_count + 1)) / (age_hours + 2)^gravity
     */
    const GRAVITY = 1.8;
    const hnScore = `(
      COALESCE((SELECT SUM(p."commentCount") FROM photo p WHERE p."postId" = post.id AND p."postBoardId" = post."boardId"), 0) * 2.0
      + COALESCE((
        SELECT COUNT(DISTINCT c."authorId")
        FROM comment c
        INNER JOIN photo p ON c."photoId" = p.id
        WHERE p."postId" = post.id
          AND p."postBoardId" = post."boardId"
          AND c."deletedAt" IS NULL
      ), 0)
      + SQRT(
        COALESCE((SELECT COUNT(*) FROM photo p2 WHERE p2."postId" = post.id AND p2."postBoardId" = post."boardId"), 0) + 1
      )
    ) / POW(
      EXTRACT(EPOCH FROM (NOW() - post."createdAt")) / 3600.0 + 2.0,
      ${GRAVITY}
    )`;

    const total = await this.postRepository.count({ where: { board: boardId as any } });

    const ranked = await this.postRepository
      .createQueryBuilder('post')
      .select(['post.id'])
      .where('post.board = :boardId', { boardId })
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
        .where('post.board = :boardId AND post.id IN (:...ids)', { boardId, ids: postIds })
        .getMany();

      const byId = new Map(postsMap.map((post) => [post.id, post]));
      posts = postIds.map((id) => byId.get(id)).filter((post): post is Post => !!post);
    }

    const items = posts.map((post) => {
      const dto = plainToInstance(PostListItemResponseDto, post, { excludeExtraneousValues: true });
      dto.photoCount = post.photos?.length ?? 0;
      return dto;
    });

    return plainToInstance(PostListResponseDto, { posts: items, total }, { excludeExtraneousValues: true });
  }

  async getPost(boardId: number, postId: number): Promise<PostResponseDto> {
    await this.validateGalleryBoard(boardId);

    const post = await this.postRepository.findOne({
      where: { id: postId, board: boardId as any },
      relations: ['author', 'photos', 'photos.image', 'photos.camera', 'photos.lens', 'photos.comments', 'photos.comments.author'],
    });

    if (!post) {
      throw new NotFoundException(createError(ErrorCode.POST_NOT_FOUND));
    }

    return plainToInstance(PostResponseDto, {
      ...post,
      photos: post.photos?.map((photo) => ({
        ...photo,
        imageKey: photo.image?.key,
      })),
    }, { excludeExtraneousValues: true });
  }

  async deletePost(user: DecodedUserToken, boardId: number, postId: number): Promise<DeletedPostResponseDto> {
    await this.validateGalleryBoard(boardId);

    const post = await this.postRepository.findOne({
      where: { id: postId, board: boardId as any },
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
    deletedPost.boardId = boardId;
    deletedPost.authorId = post.author.id;
    deletedPost.title = post.title;
    deletedPost.content = post.content;
    deletedPost.type = 'gallery';
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
    boardId: number,
    postId: number,
    photoId: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    await this.validateGalleryBoard(boardId);

    const photo = await this.photoRepository.findOne({
      where: { id: photoId, post: { id: postId, board: boardId as any } },
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

  async deletePhotoComment(user: DecodedUserToken, boardId: number, commentId: number): Promise<DeletedCommentResponseDto> {
    await this.validateGalleryBoard(boardId);

    const comment = await this.commentRepository.findOne({
      where: { id: commentId, photo: { post: { board: boardId as any } } },
      relations: ['photo', 'author'],
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
    deletedComment.boardId = boardId;
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
