import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { createError, ErrorCode } from 'src/common/exception/error';
import { BoardResponseDto } from 'src/domain/board/dto/board.response.dto';
import { SearchIn } from 'src/domain/board/dto/search-query.dto';
import { SearchResultItemResponseDto, SearchResultsResponseDto } from 'src/domain/board/dto/search.response.dto';
import { Board } from 'src/domain/board/entity/board.entity';
import { Article } from 'src/domain/article/entity/article.entity';
import { Post } from 'src/domain/post/entity/post.entity';
import { Repository } from 'typeorm';

const DEFAULT_BOARDS: Partial<Board>[] = [
  { type: 'community', name: '자유게시판', description: '자유롭게 이야기해요' },
  { type: 'community', name: '질문게시판', description: '궁금한 것을 물어봐요' },
  { type: 'gallery', name: '사진 갤러리', description: '사진을 공유해요' },
];

@Injectable()
export class BoardsService implements OnModuleInit {
  constructor(
    @InjectRepository(Board) private readonly boardRepository: Repository<Board>,
    @InjectRepository(Article) private readonly articleRepository: Repository<Article>,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) { }

  async onModuleInit() {
    const count = await this.boardRepository.count();
    if (count === 0) {
      const created = this.boardRepository.create(DEFAULT_BOARDS);
      await this.boardRepository.save(created);
    }
  }

  async getBoards(): Promise<BoardResponseDto[]> {
    const boards = await this.boardRepository.find({ order: { id: 'ASC' } });
    return plainToInstance(BoardResponseDto, boards, { excludeExtraneousValues: true });
  }

  async getBoard(boardId: number): Promise<BoardResponseDto> {
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException(createError(ErrorCode.BOARD_NOT_FOUND));
    }
    return plainToInstance(BoardResponseDto, board, { excludeExtraneousValues: true });
  }

  private buildArticleSearchCondition(searchIn: SearchIn): string {
    if (searchIn === SearchIn.TITLE) {
      return 'article.title ILIKE :keyword';
    }
    if (searchIn === SearchIn.CONTENT) {
      return 'article.content ILIKE :keyword';
    }
    return '(article.title ILIKE :keyword OR article.content ILIKE :keyword)';
  }

  private buildPostSearchCondition(searchIn: SearchIn): string {
    if (searchIn === SearchIn.TITLE) {
      return 'post.title ILIKE :keyword';
    }
    if (searchIn === SearchIn.CONTENT) {
      return 'post.content ILIKE :keyword';
    }
    return '(post.title ILIKE :keyword OR post.content ILIKE :keyword)';
  }

  private async searchAll(
    keyword: string,
    searchIn: SearchIn,
    page: number,
    limit: number,
    boardId?: number,
  ): Promise<SearchResultsResponseDto> {
    const trimmedKeyword = keyword.trim();

    // Search articles
    const articleQb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.board', 'board')
      .loadRelationCountAndMap('article.commentCount', 'article.comments')
      .loadRelationCountAndMap('article.likesCount', 'article.likes')
      .andWhere(this.buildArticleSearchCondition(searchIn), { keyword: `%${trimmedKeyword}%` });

    if (boardId !== undefined) {
      articleQb.andWhere('board.id = :boardId', { boardId });
    }

    // Search posts
    const postQb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.board', 'board')
      .andWhere(this.buildPostSearchCondition(searchIn), { keyword: `%${trimmedKeyword}%` });

    if (boardId !== undefined) {
      postQb.andWhere('board.id = :boardId', { boardId });
    }

    const [articles, articleTotal] = await articleQb.getManyAndCount();
    const [posts, postTotal] = await postQb.getManyAndCount();

    const total = articleTotal + postTotal;

    type WithCounts = { commentCount?: number; likesCount?: number };

    const articleResults = articles.map((article) => {
      const typed = article as Article & WithCounts;
      return plainToInstance(
        SearchResultItemResponseDto,
        {
          type: 'article' as const,
          id: typed.id,
          boardId: typed.board?.id,
          boardName: typed.board?.name,
          title: typed.title,
          content: typed.content,
          author: typed.author
            ? { id: typed.author.id, username: typed.author.username }
            : null,
          views: typed.views,
          likesCount: typed.likesCount ?? 0,
          commentCount: typed.commentCount ?? 0,
          createdAt: typed.createdAt,
        },
        { excludeExtraneousValues: true },
      );
    });

    const postResults = posts.map((post) =>
      plainToInstance(
        SearchResultItemResponseDto,
        {
          type: 'post' as const,
          id: post.id,
          boardId: post.board?.id,
          boardName: post.board?.name,
          title: post.title,
          content: post.content,
          author: post.author
            ? { id: post.author.id, username: post.author.username }
            : null,
          views: 0,
          likesCount: 0,
          commentCount: 0,
          createdAt: post.createdAt,
        },
        { excludeExtraneousValues: true },
      ),
    );

    const allResults = [...articleResults, ...postResults]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice((page - 1) * limit, page * limit);

    return plainToInstance(
      SearchResultsResponseDto,
      { results: allResults, total },
      { excludeExtraneousValues: true },
    );
  }

  async searchInAllBoards(
    keyword: string,
    searchIn: SearchIn = SearchIn.BOTH,
    page: number = 1,
    limit: number = 20,
  ): Promise<SearchResultsResponseDto> {
    return this.searchAll(keyword, searchIn, page, limit);
  }

  async searchInBoard(
    boardId: number,
    keyword: string,
    searchIn: SearchIn = SearchIn.BOTH,
    page: number = 1,
    limit: number = 20,
  ): Promise<SearchResultsResponseDto> {
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException(createError(ErrorCode.BOARD_NOT_FOUND));
    }

    return this.searchAll(keyword, searchIn, page, limit, boardId);
  }
}
