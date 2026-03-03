import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { createError, ErrorCode } from 'src/common/exception/error';
import { Article } from 'src/domain/article/entity/article.entity';
import { CreateArticleDto } from 'src/domain/article/dto/create-article.dto';
import {
  ArticleListItemResponseDto,
  ArticleListResponseDto,
  ArticleResponseDto,
} from 'src/domain/article/dto/article.response.dto';
import { CreateCommentDto } from 'src/common/dtos/create-comment.dto';
import { CommentResponseDto } from 'src/common/dtos/comment.response.dto';
import { DeletedPostResponseDto } from 'src/domain/post/dto/deleted-post.response.dto';
import { Board } from 'src/domain/board/entity/board.entity';
import { Image } from 'src/domain/aws/entity/image.entity';
import { DecodedUserToken, User } from 'src/domain/user/entity/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Photo } from 'src/common/entities/photo.entity';
import { DeletedPost } from 'src/common/entities/deleted-post.entity';
import { Comment } from 'src/common/entities/comment.entity';
import { DeletedComment } from 'src/common/entities/deleted-comment.entity';
import { DeletedCommentResponseDto } from 'src/common/dtos/deleted-comment.response.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article) private readonly articleRepository: Repository<Article>,
    @InjectRepository(Board) private readonly boardRepository: Repository<Board>,
    @InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Photo) private readonly photoRepository: Repository<Photo>,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(DeletedPost) private readonly deletedPostRepository: Repository<DeletedPost>,
    private readonly dataSource: DataSource,
  ) { }

  private async validateCommunityBoard(boardId: number): Promise<Board> {
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException(createError(ErrorCode.BOARD_NOT_FOUND));
    }
    if (board.type !== 'community') {
      throw new BadRequestException(createError(ErrorCode.BOARD_TYPE_MISMATCH));
    }
    return board;
  }

  async createArticle(user: DecodedUserToken, boardId: number, dto: CreateArticleDto): Promise<ArticleResponseDto> {
    const board = await this.validateCommunityBoard(boardId);

    return await this.dataSource.transaction(async (manager) => {
      board.maxPostId += 1;
      await manager.save(Board, board);

      const article = new Article();
      article.id = board.maxPostId;
      article.board = board;
      article.author = { id: user.id } as User;
      article.title = dto.title;
      article.content = dto.content;

      if (dto.referencedPhotoIds && dto.referencedPhotoIds.length > 0) {
        const photos = await manager.findBy(Photo, { id: In(dto.referencedPhotoIds) });
        article.referencedPhotos = photos;
      }

      if (dto.imageIds && dto.imageIds.length > 0) {
        const images = await manager.findBy(Image, { id: In(dto.imageIds) });
        article.attachedImages = images;
      }

      const saved = await manager.save(Article, article);
      return plainToInstance(ArticleResponseDto, saved, { excludeExtraneousValues: true });
    });
  }

  async getArticles(boardId: number, page: number = 1, limit: number = 20): Promise<ArticleListResponseDto> {
    await this.validateCommunityBoard(boardId);

    const [articles, total] = await this.articleRepository.findAndCount({
      where: { board: boardId as any },
      relations: ['author', 'comments', 'likes', 'attachedImages', 'referencedPhotos', 'referencedPhotos.image'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = articles.map((article) => {
      const dto = plainToInstance(ArticleListItemResponseDto, article, { excludeExtraneousValues: true });
      dto.commentCount = article.comments?.length ?? 0;
      dto.likesCount = article.likes?.length ?? 0;
      dto.thumbnailKey =
        article.attachedImages?.[0]?.key
        ?? article.referencedPhotos?.[0]?.image?.key
        ?? null;
      return dto;
    });

    return plainToInstance(ArticleListResponseDto, { articles: items, total }, { excludeExtraneousValues: true });
  }

  async getPopularArticles(boardId: number, page: number = 1, limit: number = 20): Promise<ArticleListResponseDto> {
    await this.validateCommunityBoard(boardId);

    /**
     * Score = (likes * 2 + comments + sqrt(views)) / (age_hours + 2)^gravity
     */
    const GRAVITY = 1.8;
    const hnScore = `(
      (SELECT COUNT(*) FROM users_liked_posts ulp WHERE ulp."postId" = article.id) * 2.0
      + (SELECT COUNT(*) FROM comment c WHERE c."postId" = article.id AND c."deletedAt" IS NULL)
      + SQRT(GREATEST(article.views, 1))
    ) / POW(
      EXTRACT(EPOCH FROM (NOW() - article."createdAt")) / 3600.0 + 2.0,
      ${GRAVITY}
    )`;

    const total = await this.articleRepository.count({ where: { board: boardId as any } });

    const ranked = await this.articleRepository
      .createQueryBuilder('article')
      .select(['article.id', 'article.board'])
      .where('article.board = :boardId', { boardId })
      .orderBy(hnScore, 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany<{ article_id: number }>();

    const articleIds = ranked.map((r) => r.article_id);

    let articles: Article[] = [];
    if (articleIds.length > 0) {
      const articlesMap = await this.articleRepository
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.author', 'author')
        .leftJoinAndSelect('article.comments', 'comments')
        .leftJoinAndSelect('article.likes', 'likes')
        .leftJoinAndSelect('article.attachedImages', 'attachedImages')
        .leftJoinAndSelect('article.referencedPhotos', 'referencedPhotos')
        .where('article.board = :boardId AND article.id IN (:...ids)', { boardId, ids: articleIds })
        .getMany();

      const byId = new Map(articlesMap.map((a) => [a.id, a]));
      articles = articleIds.map((id) => byId.get(id)).filter((a): a is Article => !!a);
    }

    const items = articles.map((article) => {
      const dto = plainToInstance(ArticleListItemResponseDto, article, { excludeExtraneousValues: true });
      dto.commentCount = article.comments?.length ?? 0;
      dto.likesCount = article.likes?.length ?? 0;
      dto.thumbnailKey =
        article.attachedImages?.[0]?.key
        ?? article.referencedPhotos?.[0]?.image?.key
        ?? null;
      return dto;
    });

    return plainToInstance(ArticleListResponseDto, { articles: items, total }, { excludeExtraneousValues: true });
  }

  async getArticle(boardId: number, articleId: number): Promise<ArticleResponseDto> {
    await this.validateCommunityBoard(boardId);

    const article = await this.articleRepository.findOne({
      where: { id: articleId, board: boardId as any },
      relations: [
        'author',
        'comments', 'comments.parent', 'comments.author',
        'comments.replies', 'comments.replies.author',
        'likes',
        'referencedPhotos', 'referencedPhotos.image',
        'attachedImages',
      ],
    });

    if (!article) {
      throw new NotFoundException(createError(ErrorCode.ARTICLE_NOT_FOUND));
    }

    article.views += 1;
    await this.articleRepository.save(article);

    article.comments = article.comments?.filter((c) => !c.parent) ?? [];

    const dto = plainToInstance(ArticleResponseDto, article, { excludeExtraneousValues: true });
    dto.likesCount = article.likes?.length ?? 0;
    return dto;
  }

  async deleteArticle(user: DecodedUserToken, boardId: number, articleId: number): Promise<DeletedPostResponseDto> {
    await this.validateCommunityBoard(boardId);

    const article = await this.articleRepository.findOne({
      where: { id: articleId, board: boardId as any },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException(createError(ErrorCode.ARTICLE_NOT_FOUND));
    }

    if (article.author.id !== user.id) {
      throw new BadRequestException(createError(ErrorCode.NO_PERMISSION_TO_EDIT));
    }

    const deletedPost = new DeletedPost();
    deletedPost.originalPostId = article.id;
    deletedPost.boardId = boardId;
    deletedPost.authorId = article.author.id;
    deletedPost.title = article.title;
    deletedPost.content = article.content;
    deletedPost.type = 'community';
    deletedPost.views = article.views;
    deletedPost.originalCreatedAt = article.createdAt as Date;

    const saved = await this.dataSource.transaction(async (manager) => {
      const result = await manager.save(DeletedPost, deletedPost);
      await manager.remove(Article, article);
      return result;
    });

    return plainToInstance(DeletedPostResponseDto, saved, { excludeExtraneousValues: true });
  }

  async toggleLike(user: DecodedUserToken, boardId: number, articleId: number): Promise<{ liked: boolean }> {
    await this.validateCommunityBoard(boardId);

    const article = await this.articleRepository.findOne({
      where: { id: articleId, board: boardId as any },
      relations: ['likes'],
    });

    if (!article) {
      throw new NotFoundException(createError(ErrorCode.ARTICLE_NOT_FOUND));
    }

    const alreadyLiked = article.likes.some((u) => u.id === user.id);

    if (alreadyLiked) {
      article.likes = article.likes.filter((u) => u.id !== user.id);
    } else {
      const userEntity = await this.userRepository.findOne({ where: { id: user.id } });
      if (userEntity) {
        article.likes.push(userEntity);
      }
    }

    await this.articleRepository.save(article);
    return { liked: !alreadyLiked };
  }

  async createComment(user: DecodedUserToken, boardId: number, articleId: number, dto: CreateCommentDto): Promise<CommentResponseDto> {
    await this.validateCommunityBoard(boardId);

    const article = await this.articleRepository.findOne({
      where: { id: articleId, board: boardId as any },
    });

    if (!article) {
      throw new NotFoundException(createError(ErrorCode.ARTICLE_TO_COMMENT_NOT_FOUND));
    }

    const comment = new Comment();
    comment.post = article;
    comment.author = { id: user.id } as User;
    comment.content = dto.content;

    if (dto.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: dto.parentId, post: { id: articleId, board: boardId as any } },
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
      relations: ['author', 'post', 'post.board'],
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
    deletedComment.boardId = comment.post.board.id;
    deletedComment.authorId = comment.author.id;
    deletedComment.content = comment.content;
    deletedComment.originalCreatedAt = comment.createdAt as Date;
    deletedComment.deletedAt = new Date();

    await this.dataSource.transaction(async (manager) => {
      await manager.save(DeletedComment, deletedComment);
      await manager.softRemove(comment);
    });

    return plainToInstance(DeletedCommentResponseDto, deletedComment, { excludeExtraneousValues: true });
  }
}
