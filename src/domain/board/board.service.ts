import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { BoardResponseDto } from 'src/domain/board/dto/board.response.dto';
import { Board } from 'src/domain/board/entity/board.entity';
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
}
