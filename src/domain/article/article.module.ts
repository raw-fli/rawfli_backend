import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from 'src/domain/article/entity/article.entity';
import { ArticleController } from 'src/domain/article/article.controller';
import { ArticleService } from 'src/domain/article/article.service';
import { Board } from 'src/domain/board/entity/board.entity';
import { Image } from 'src/domain/aws/entity/image.entity';
import { User } from 'src/domain/user/entity/user.entity';
import { Photo } from 'src/common/entities/photo.entity';
import { Comment } from 'src/common/entities/comment.entity';
import { DeletedPost } from 'src/common/entities/deleted-post.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Board, Comment, Photo, Image, User, DeletedPost]),
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule { }
