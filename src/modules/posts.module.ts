import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from 'src/controllers/posts.controller';
import { Board } from 'src/models/tables/board.entity';
import { Comment } from 'src/models/tables/comment.entity';
import { Image } from 'src/models/tables/image.entity';
import { Photo } from 'src/models/tables/photo.entity';
import { CommunityPost, GalleryPost, Post } from 'src/models/tables/post.entity';
import { DeletedPost } from 'src/models/tables/deleted-post.entity';
import { User } from 'src/models/tables/user.entity';
import { PostsService } from 'src/providers/posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, CommunityPost, GalleryPost, Board, Comment, Photo, Image, User, DeletedPost]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule { }
