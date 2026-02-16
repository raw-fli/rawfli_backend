import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsController } from 'src/controllers/boards.controller';
import { Board } from 'src/models/tables/board.entity';
import { BoardsService } from 'src/providers/boards.service';

@Module({
  imports: [TypeOrmModule.forFeature([Board])],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule { }
