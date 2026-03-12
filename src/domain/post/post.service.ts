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

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Board) private readonly boardRepository: Repository<Board>,
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
        const photos = await Promise.all(
          dto.imageIds.map(async (imageId, index) => {
            const image = images.find((img) => img.id === imageId);
            if (!image) return null;

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

            return photo;
          }),
        );
        await manager.save(Photo, photos.filter(Boolean) as Photo[]);
      }

      return plainToInstance(PostResponseDto, savedPost, { excludeExtraneousValues: true });
    });
  }

  async getPosts(boardId: number, page: number = 1, limit: number = 20): Promise<PostListResponseDto> {
    await this.validateGalleryBoard(boardId);

    const [posts, total] = await this.postRepository.findAndCount({
      where: { board: boardId as any },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = posts.map((post) =>
      plainToInstance(PostListItemResponseDto, post, { excludeExtraneousValues: true }),
    );

    return plainToInstance(PostListResponseDto, { posts: items, total }, { excludeExtraneousValues: true });
  }

  async getPost(boardId: number, postId: number): Promise<PostResponseDto> {
    await this.validateGalleryBoard(boardId);

    const post = await this.postRepository.findOne({
      where: { id: postId, board: boardId as any },
      relations: ['author', 'photos', 'photos.image', 'photos.camera', 'photos.lens'],
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
}
