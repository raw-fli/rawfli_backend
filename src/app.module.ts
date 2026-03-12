import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './domain/user/user.module';
import { AuthModule } from './domain/auth/auth.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerMiddleware } from './common/middlewares/logger.middlewares';
import { AwsModule } from './domain/aws/aws.module';
import { BoardsModule } from './domain/board/board.module';
import { PostsModule } from './domain/post/post.module';
import { User } from './domain/user/entity/user.entity';
import { Post } from './domain/post/entity/post.entity';
import { Comment } from './common/entities/comment.entity';
import { Photo } from './common/entities/photo.entity';
import { Image } from './domain/aws/entity/image.entity';
import { Board } from './domain/board/entity/board.entity';
import { DeletedPost } from './common/entities/deleted-post.entity';
import { Article } from './domain/article/entity/article.entity';
import { ArticleModule } from './domain/article/article.module';
import { DeletedComment } from './common/entities/deleted-comment.entity';
import { Follow } from './domain/user/entity/follow.entity';
import { MeModule } from './domain/me/me.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60, limit: 60 }]),
    CacheModule.register({ isGlobal: true }),
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('localhost'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        entities: [User, Post, Article, Comment, Photo, Image, Board, DeletedPost, DeletedComment, Follow],
        synchronize: true,
        // extra: {
        //   ssl: true,
        // },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    AwsModule,
    BoardsModule,
    PostsModule,
    ArticleModule,
    MeModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
