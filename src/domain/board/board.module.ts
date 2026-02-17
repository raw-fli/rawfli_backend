import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsController } from 'src/domain/board/board.controller';
import { Board } from 'src/domain/board/entity/board.entity';
import { BoardsService } from 'src/domain/board/board.service';

@Module({
  imports: [TypeOrmModule.forFeature([Board])],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule { }
