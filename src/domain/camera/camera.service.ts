import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { createError, ErrorCode } from 'src/common/exception/error';
import { sanitizeExifString } from 'src/common/utils/exif.utils';
import { Camera } from 'src/domain/camera/entity/camera.entity';
import { CameraAlias } from 'src/domain/camera/entity/camera-alias.entity';
import { CameraListResponseDto, CameraResponseDto } from 'src/domain/camera/dto/camera.response.dto';
import { Photo } from 'src/common/entities/photo.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class CamerasService {
  constructor(
    @InjectRepository(Camera) private readonly cameraRepository: Repository<Camera>,
    @InjectRepository(CameraAlias) private readonly cameraAliasRepository: Repository<CameraAlias>,
    private readonly dataSource: DataSource,
  ) { }

  async findOrCreateByExif(
    rawExifName: string,
    brand?: string | null,
    manager?: EntityManager,
  ): Promise<Camera> {
    const sanitized = sanitizeExifString(rawExifName);

    const aliasRepo = manager?.getRepository(CameraAlias) ?? this.cameraAliasRepository;
    const cameraRepo = manager?.getRepository(Camera) ?? this.cameraRepository;

    const existing = await aliasRepo.findOne({
      where: { rawExifName: sanitized },
      relations: ['camera'],
    });

    if (existing) return existing.camera;

    try {
      const camera = new Camera();
      camera.brand = brand ? sanitizeExifString(brand) : null;
      camera.modelName = sanitized;
      camera.isVerified = false;
      const savedCamera = await cameraRepo.save(camera);

      const alias = new CameraAlias();
      alias.rawExifName = sanitized;
      alias.camera = savedCamera;
      await aliasRepo.save(alias);

      return savedCamera;
    } catch {
      const retried = await aliasRepo.findOne({
        where: { rawExifName: sanitized },
        relations: ['camera'],
      });
      if (retried) return retried.camera;
      throw new Error('Failed to create camera from EXIF data');
    }
  }

  async getCameras(page: number = 1, limit: number = 20): Promise<CameraListResponseDto> {
    const [cameras, total] = await this.cameraRepository.findAndCount({
      relations: ['aliases'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = cameras.map((c) =>
      plainToInstance(CameraResponseDto, c, { excludeExtraneousValues: true }),
    );

    return plainToInstance(
      CameraListResponseDto,
      { cameras: items, total },
      { excludeExtraneousValues: true },
    );
  }

  async getUnverifiedCameras(page: number = 1, limit: number = 20): Promise<CameraListResponseDto> {
    const [cameras, total] = await this.cameraRepository.findAndCount({
      where: { isVerified: false },
      relations: ['aliases'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = cameras.map((c) =>
      plainToInstance(CameraResponseDto, c, { excludeExtraneousValues: true }),
    );

    return plainToInstance(
      CameraListResponseDto,
      { cameras: items, total },
      { excludeExtraneousValues: true },
    );
  }

  async mergeCameras(targetId: number, sourceIds: number[]): Promise<CameraResponseDto> {
    const target = await this.cameraRepository.findOne({
      where: { id: targetId },
      relations: ['aliases'],
    });

    if (!target) {
      throw new NotFoundException(createError(ErrorCode.CAMERA_NOT_FOUND));
    }

    const filteredSourceIds = sourceIds.filter((id) => id !== targetId);
    if (filteredSourceIds.length === 0) {
      return plainToInstance(CameraResponseDto, target, { excludeExtraneousValues: true });
    }

    return await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(CameraAlias)
        .set({ camera: target })
        .where('cameraId IN (:...sourceIds)', { sourceIds: filteredSourceIds })
        .execute();

      await manager
        .createQueryBuilder()
        .update(Photo)
        .set({ camera: target })
        .where('cameraId IN (:...sourceIds)', { sourceIds: filteredSourceIds })
        .execute();

      await manager.softRemove(
        Camera,
        filteredSourceIds.map((id) => ({ id })),
      );

      const merged = await manager.findOne(Camera, {
        where: { id: targetId },
        relations: ['aliases'],
      });

      return plainToInstance(CameraResponseDto, merged, { excludeExtraneousValues: true });
    });
  }
}
