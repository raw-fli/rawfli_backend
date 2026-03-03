import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { createError, ErrorCode } from 'src/common/exception/error';
import { CreateCommentDto } from 'src/common/dtos/create-comment.dto';
import { CreatePostDto } from 'src/domain/post/dto/create-post.dto';
import { CommentResponseDto } from 'src/common/dtos/comment.response.dto';
import { DeletedPostResponseDto } from 'src/domain/post/dto/deleted-post.response.dto';
import { PostListItemResponseDto, PostListResponseDto, PostResponseDto } from 'src/domain/post/dto/post.response.dto';
import { Board } from 'src/domain/board/entity/board.entity';
import { Comment } from 'src/common/entities/comment.entity';
import { Image } from 'src/domain/aws/entity/image.entity';
import { Photo } from 'src/common/entities/photo.entity';
import { GalleryPost, Post } from 'src/domain/post/entity/post.entity';
import { DeletedPost } from 'src/common/entities/deleted-post.entity';
import { DecodedUserToken, User } from 'src/domain/user/entity/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import { DeletedComment } from 'src/common/entities/deleted-comment.entity';
import { DeletedCommentResponseDto } from 'src/common/dtos/deleted-comment.response.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(GalleryPost) private readonly galleryPostRepository: Repository<GalleryPost>,
    @InjectRepository(Board) private readonly boardRepository: Repository<Board>,
    @InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Photo) private readonly photoRepository: Repository<Photo>,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(DeletedPost) private readonly deletedPostRepository: Repository<DeletedPost>,
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

      const post = new GalleryPost();
      post.id = board.maxPostId;
      post.board = board;
      post.author = { id: user.id } as User;
      post.title = dto.title;
      post.content = dto.content;
      const savedPost = await manager.save(GalleryPost, post);

      if (dto.imageIds && dto.imageIds.length > 0) {
        const images = await manager.findBy(Image, { id: In(dto.imageIds) });
        const photos = dto.imageIds.map((imageId, index) => {
          const photo = new Photo();
          photo.image = images.find((img) => img.id === imageId)!;
          photo.post = savedPost;
          photo.author = { id: user.id } as User;
          photo.description = dto.photoDescriptions?.[index] ?? undefined;
          return photo;
        });
        await manager.save(Photo, photos);
      }

      return plainToInstance(PostResponseDto, savedPost, { excludeExtraneousValues: true });
    });
  }

  async getPosts(boardId: number, page: number = 1, limit: number = 20): Promise<PostListResponseDto> {
    await this.validateGalleryBoard(boardId);

    const [posts, total] = await this.postRepository.findAndCount({
      where: { board: boardId as any },
      relations: ['author', 'comments'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = posts.map((post) => {
      const dto = plainToInstance(PostListItemResponseDto, post, { excludeExtraneousValues: true });
      dto.commentCount = post.comments?.length ?? 0;
      return dto;
    });

    return plainToInstance(PostListResponseDto, { posts: items, total }, { excludeExtraneousValues: true });
  }

  async getPost(boardId: number, postId: number): Promise<PostResponseDto> {
    await this.validateGalleryBoard(boardId);

    const post = await this.postRepository.findOne({
      where: { id: postId, board: boardId as any },
      relations: ['author', 'comments', 'comments.author', 'comments.parent', 'likes'],
    });

    if (!post) {
      throw new NotFoundException(createError(ErrorCode.ARTICLE_NOT_FOUND));
    }

    post.views += 1;
    await this.postRepository.save(post);

    const commentMap = new Map<number, Comment>();
    for (const comment of post.comments ?? []) {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    }

    const rootComments: Comment[] = [];
    for (const comment of post.comments ?? []) {
      if (comment.parent) {
        const parent = commentMap.get(comment.parent.id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    }

    post.comments = rootComments;

    const dto = plainToInstance(PostResponseDto, post, { excludeExtraneousValues: true });
    dto.likesCount = post.likes?.length ?? 0;
    return dto;
  }

  async deletePost(user: DecodedUserToken, boardId: number, postId: number): Promise<DeletedPostResponseDto> {
    await this.validateGalleryBoard(boardId);

    const post = await this.postRepository.findOne({
      where: { id: postId, board: boardId as any },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(createError(ErrorCode.ARTICLE_NOT_FOUND));
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
    deletedPost.type = (post as any).type ?? 'unknown';
    deletedPost.views = post.views;
    deletedPost.originalCreatedAt = post.createdAt as Date;

    const saved = await this.dataSource.transaction(async (manager) => {
      const result = await manager.save(DeletedPost, deletedPost);
      await manager.remove(Post, post);
      return result;
    });

    return plainToInstance(DeletedPostResponseDto, saved, { excludeExtraneousValues: true });
  }

  async toggleLike(user: DecodedUserToken, boardId: number, postId: number): Promise<{ liked: boolean }> {
    await this.validateGalleryBoard(boardId);

    const post = await this.postRepository.findOne({
      where: { id: postId, board: boardId as any },
      relations: ['likes'],
    });

    if (!post) {
      throw new NotFoundException(createError(ErrorCode.ARTICLE_NOT_FOUND));
    }

    const alreadyLiked = post.likes.some((u) => u.id === user.id);

    if (alreadyLiked) {
      post.likes = post.likes.filter((u) => u.id !== user.id);
    } else {
      const userEntity = await this.userRepository.findOne({ where: { id: user.id } });
      if (userEntity) {
        post.likes.push(userEntity);
      }
    }

    await this.postRepository.save(post);
    return { liked: !alreadyLiked };
  }

  async createComment(user: DecodedUserToken, boardId: number, postId: number, dto: CreateCommentDto): Promise<CommentResponseDto> {
    await this.validateGalleryBoard(boardId);

    const post = await this.postRepository.findOne({
      where: { id: postId, board: boardId as any },
    });

    if (!post) {
      throw new NotFoundException(createError(ErrorCode.ARTICLE_TO_COMMENT_NOT_FOUND));
    }

    const comment = new Comment();
    comment.post = post;
    comment.author = { id: user.id } as User;
    comment.content = dto.content;

    if (dto.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: dto.parentId, post: { id: postId, board: boardId as any } },
      });

      if (!parentComment) {
        throw new NotFoundException(createError(ErrorCode.COMMENT_TO_REPLY_NOT_FOUND));
      }

      comment.parent = parentComment;
    }

    const saved = await this.commentRepository.save(comment);
    return plainToInstance(CommentResponseDto, saved, { excludeExtraneousValues: true });
  }

  async deleteComment(user: DecodedUserToken, commentId: number): Promise<DeletedCommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException(createError(ErrorCode.COMMENT_NOT_FOUND));
    }

    if (comment.author.id !== user.id) {
      throw new BadRequestException(createError(ErrorCode.NO_PERMISSION_TO_EDIT));
    }

    const deletedComment = new DeletedComment();
    deletedComment.originalCommentId = comment.id;
    deletedComment.postId = comment.post.id;
    deletedComment.authorId = comment.author.id;
    deletedComment.content = comment.content;
    deletedComment.originalCreatedAt = comment.createdAt as Date;
    await this.dataSource.transaction(async (manager) => {
      await manager.save(DeletedComment, deletedComment);
      await manager.softRemove(Comment, comment);
    });

    return plainToInstance(DeletedCommentResponseDto, deletedComment, { excludeExtraneousValues: true });
  }

  async getDeletedPosts(boardId: number): Promise<DeletedPost[]> {
    return await this.deletedPostRepository.find({
      where: { boardId },
      order: { deletedAt: 'DESC' },
    });
  }
}
