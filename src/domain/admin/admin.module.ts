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
import { CamerasModule } from 'src/domain/camera/camera.module';
import { LensesModule } from 'src/domain/lens/lens.module';

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
    TypeOrmModule.forFeature([Admin]),
    CamerasModule,
    LensesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminLocalStrategy, AdminJwtStrategy],
  exports: [AdminService],
})
export class AdminModule { }
