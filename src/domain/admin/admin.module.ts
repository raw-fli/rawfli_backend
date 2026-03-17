import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from 'src/domain/admin/admin.controller';
import { AdminService } from 'src/domain/admin/admin.service';
import { Admin } from 'src/domain/admin/entity/admin.entity';
import { AdminLocalStrategy } from 'src/domain/admin/strategies/admin-local.strategy';
import { AdminJwtStrategy } from 'src/domain/admin/strategies/admin-jwt.strategy';
import { AdminGuard } from 'src/domain/admin/guards/admin.guard';
import { AdminSignupGuard } from 'src/domain/admin/guards/admin-signup.guard';
import { CamerasModule } from 'src/domain/camera/camera.module';
import { LensesModule } from 'src/domain/lens/lens.module';
import { Image } from 'src/domain/aws/entity/image.entity';
import { DeletedPost } from 'src/common/entities/deleted-post.entity';
import { DeletedComment } from 'src/common/entities/deleted-comment.entity';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('ADMIN_SECRET_KEY'),
        signOptions: { algorithm: 'HS256', expiresIn: '1h' },
      }),
    }),
    TypeOrmModule.forFeature([Admin, Image, DeletedPost, DeletedComment]),
    CamerasModule,
    LensesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminLocalStrategy, AdminJwtStrategy, AdminGuard, AdminSignupGuard],
  exports: [AdminService],
})
export class AdminModule { }
