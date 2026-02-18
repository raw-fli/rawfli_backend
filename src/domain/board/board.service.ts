import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { createError, ErrorCode } from 'src/common/exception/error';
import { BoardResponseDto } from 'src/domain/board/dto/board.response.dto';
import { SearchIn } from 'src/domain/board/dto/search-query.dto';
import { SearchResultItemResponseDto, SearchResultsResponseDto } from 'src/domain/board/dto/search.response.dto';
import { Board } from 'src/domain/board/entity/board.entity';
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

  private buildSearchCondition(searchIn: SearchIn): string {
    if (searchIn === SearchIn.TITLE) {
      return 'post.title ILIKE :keyword';
    }
    if (searchIn === SearchIn.CONTENT) {
      return 'post.content ILIKE :keyword';
    }
    return '(post.title ILIKE :keyword OR post.content ILIKE :keyword)';
  }

  private async searchPosts(
    keyword: string,
    searchIn: SearchIn,
    page: number,
    limit: number,
    boardId?: number,
  ): Promise<SearchResultsResponseDto> {
    const trimmedKeyword = keyword.trim();

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.board', 'board')
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .loadRelationCountAndMap('post.likesCount', 'post.likes')
      .where('post.type IN (:...types)', { types: ['gallery', 'community'] })
      .andWhere(this.buildSearchCondition(searchIn), { keyword: `%${trimmedKeyword}%` });

    if (boardId !== undefined) {
      queryBuilder.andWhere('board.id = :boardId', { boardId });
    }

    queryBuilder
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [posts, total] = await queryBuilder.getManyAndCount();

    const results = posts.map((post) => {
      const typedPost = post as Post & {
        commentCount?: number;
        likesCount?: number;
      };

      return plainToInstance(
        SearchResultItemResponseDto,
        {
          type: typedPost.board?.type === 'community' ? 'article' : 'post',
          id: typedPost.id,
          boardId: typedPost.board?.id,
          boardName: typedPost.board?.name,
          title: typedPost.title,
          content: typedPost.content,
          author: typedPost.author
            ? { id: typedPost.author.id, username: typedPost.author.username }
            : null,
          views: typedPost.views,
          likesCount: typedPost.likesCount ?? 0,
          commentCount: typedPost.commentCount ?? 0,
          createdAt: typedPost.createdAt,
        },
        { excludeExtraneousValues: true },
      );
    });

    return plainToInstance(
      SearchResultsResponseDto,
      { results, total },
      { excludeExtraneousValues: true },
    );
  }

  async searchInAllBoards(
    keyword: string,
    searchIn: SearchIn = SearchIn.BOTH,
    page: number = 1,
    limit: number = 20,
  ): Promise<SearchResultsResponseDto> {
    return this.searchPosts(keyword, searchIn, page, limit);
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

    return this.searchPosts(keyword, searchIn, page, limit, boardId);
  }
}
