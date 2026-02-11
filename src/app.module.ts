import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HttpExceptionFilter } from './auth/common/filters/http-exception.filter';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerMiddleware } from './common/middlewares/logger.middlewares';
import { AwsModule } from './modules/aws.module';
import { User } from './models/tables/user.entity';
import { Post, CommunityPost, GalleryPost } from './models/tables/post.entity';
import { Comment } from './models/tables/comment.entity';
import { Photo } from './models/tables/photo.entity';
import { Image } from './models/tables/image.entity';
import { Board } from './models/tables/board.entity';

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
        entities: [User, Post, CommunityPost, GalleryPost, Comment, Photo, Image, Board],
        synchronize: true,
        // extra: {
        //   ssl: true,
        // },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    AwsModule,
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
