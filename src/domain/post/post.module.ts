import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from 'src/domain/post/post.controller';
import { Board } from 'src/domain/board/entity/board.entity';
import { Image } from 'src/domain/aws/entity/image.entity';
import { Photo } from 'src/common/entities/photo.entity';
import { Post } from 'src/domain/post/entity/post.entity';
import { DeletedPost } from 'src/common/entities/deleted-post.entity';
import { User } from 'src/domain/user/entity/user.entity';
import { PostsService } from 'src/domain/post/post.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Board, Photo, Image, User, DeletedPost]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule { }
