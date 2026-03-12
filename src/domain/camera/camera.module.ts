import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CamerasController } from 'src/domain/camera/camera.controller';
import { CamerasService } from 'src/domain/camera/camera.service';
import { Camera } from 'src/domain/camera/entity/camera.entity';
import { CameraAlias } from 'src/domain/camera/entity/camera-alias.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Camera, CameraAlias])],
  controllers: [CamerasController],
  providers: [CamerasService],
  exports: [CamerasService],
})
export class CamerasModule { }
