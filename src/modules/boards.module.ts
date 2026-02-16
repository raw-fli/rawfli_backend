import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsController } from 'src/controllers/boards.controller';
import { Board } from 'src/models/tables/board.entity';
import { BoardsService } from 'src/providers/boards.service';
import { PostsModule } from './posts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Board]), PostsModule],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule { }
