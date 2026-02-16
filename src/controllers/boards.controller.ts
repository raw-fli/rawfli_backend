import { Controller, Get } from '@nestjs/common';
import { BoardResponseDto } from 'src/models/dtos/response/board.response.dto';
import { BoardsService } from 'src/providers/boards.service';
import { createResponseForm, Try } from 'src/types';

@Controller('api/v1/boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) { }

  @Get()
  async getBoards(): Promise<Try<BoardResponseDto[]>> {
    const boards = await this.boardsService.getBoards();
    return createResponseForm(boards);
  }
}
