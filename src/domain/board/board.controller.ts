import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { BoardResponseDto } from 'src/domain/board/dto/board.response.dto';
import { SearchQueryDto } from 'src/domain/board/dto/search-query.dto';
import { SearchResultsResponseDto } from 'src/domain/board/dto/search.response.dto';
import { BoardsService } from 'src/domain/board/board.service';
import { createResponseForm, Try } from 'src/common/types';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('boards')
@Controller('api/v1/boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) { }

  @ApiOperation({ summary: '게시판 목록 조회' })
  @ApiOkResponse({ type: [BoardResponseDto] })
  @Get()
  async getBoards(): Promise<Try<BoardResponseDto[]>> {
    const boards = await this.boardsService.getBoards();
    return createResponseForm(boards);
  }

  @ApiOperation({ summary: '전체 게시글 검색' })
  @ApiOkResponse({ type: SearchResultsResponseDto })
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

  @ApiOperation({ summary: '게시판 조회' })
  @ApiOkResponse({ type: BoardResponseDto })
  @Get(':boardId')
  async getBoard(
    @Param('boardId', ParseIntPipe) boardId: number,
  ): Promise<Try<BoardResponseDto>> {
    const board = await this.boardsService.getBoard(boardId);
    return createResponseForm(board);
  }

  @ApiOperation({ summary: '게시판 내 게시글 검색' })
  @ApiOkResponse({ type: SearchResultsResponseDto })
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
