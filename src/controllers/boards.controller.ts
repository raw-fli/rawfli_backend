import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { BoardResponseDto } from 'src/models/dtos/response/board.response.dto';
import { PostListResponseDto } from 'src/models/dtos/response/post.response.dto';
import { BoardsService } from 'src/providers/boards.service';
import { PostsService } from 'src/providers/posts.service';
import { createResponseForm, Try } from 'src/types';

@Controller('api/v1/boards')
export class BoardsController {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly postsService: PostsService,
  ) { }

  @Get()
  async getBoards(): Promise<Try<BoardResponseDto[]>> {
    const boards = await this.boardsService.getBoards();
    return createResponseForm(boards);
  }

  @Get(':boardId/posts')
  async getPosts(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Try<PostListResponseDto>> {
    const result = await this.postsService.getPosts(
      boardId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return createResponseForm(result);
  }
}
