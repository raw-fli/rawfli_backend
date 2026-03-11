import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsController } from 'src/domain/board/board.controller';
import { Board } from 'src/domain/board/entity/board.entity';
import { BoardsService } from 'src/domain/board/board.service';
import { Article } from 'src/domain/article/entity/article.entity';
import { Post } from 'src/domain/post/entity/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Article, Post])],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule { }
