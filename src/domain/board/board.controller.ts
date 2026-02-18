import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { BoardResponseDto } from 'src/domain/board/dto/board.response.dto';
import { SearchQueryDto } from 'src/domain/board/dto/search-query.dto';
import { SearchResultsResponseDto } from 'src/domain/board/dto/search.response.dto';
import { BoardsService } from 'src/domain/board/board.service';
import { createResponseForm, Try } from 'src/common/types';

@Controller('api/v1/boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) { }

  @Get()
  async getBoards(): Promise<Try<BoardResponseDto[]>> {
    const boards = await this.boardsService.getBoards();
    return createResponseForm(boards);
  }

  @Get('search')
  async searchInAllBoards(
    @Query() query: SearchQueryDto,
  ): Promise<Try<SearchResultsResponseDto>> {
    const result = await this.boardsService.searchInAllBoards(
      query.keyword,
      query.searchIn,
      query.page,
      query.limit,
    );

    return createResponseForm(result);
  }

  @Get(':boardId/search')
  async searchInBoard(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query() query: SearchQueryDto,
  ): Promise<Try<SearchResultsResponseDto>> {
    const result = await this.boardsService.searchInBoard(
      boardId,
      query.keyword,
      query.searchIn,
      query.page,
      query.limit,
    );

    return createResponseForm(result);
  }
}
