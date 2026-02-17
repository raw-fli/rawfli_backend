import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from 'src/domain/post/post.controller';
import { Board } from 'src/domain/board/entity/board.entity';
import { Comment } from 'src/domain/post/entity/comment.entity';
import { Image } from 'src/domain/aws/entity/image.entity';
import { Photo } from 'src/domain/post/entity/photo.entity';
import { CommunityPost, GalleryPost, Post } from 'src/domain/post/entity/post.entity';
import { DeletedPost } from 'src/domain/post/entity/deleted-post.entity';
import { User } from 'src/domain/user/entity/user.entity';
import { PostsService } from 'src/domain/post/post.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, CommunityPost, GalleryPost, Board, Comment, Photo, Image, User, DeletedPost]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule { }
