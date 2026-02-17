import { Controller, Get } from '@nestjs/common';
import { BoardResponseDto } from 'src/domain/board/dto/board.response.dto';
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
}
