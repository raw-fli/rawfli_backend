import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { createError, ErrorCode } from 'src/common/exception/error';
import { sanitizeExifString } from 'src/common/utils/exif.utils';
import { Lens } from 'src/domain/lens/entity/lens.entity';
import { LensAlias } from 'src/domain/lens/entity/lens-alias.entity';
import { LensListResponseDto, LensResponseDto } from 'src/domain/lens/dto/lens.response.dto';
import { Photo } from 'src/common/entities/photo.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class LensesService {
  constructor(
    @InjectRepository(Lens) private readonly lensRepository: Repository<Lens>,
    @InjectRepository(LensAlias) private readonly lensAliasRepository: Repository<LensAlias>,
    private readonly dataSource: DataSource,
  ) { }

  async findOrCreateByExif(
    rawExifName: string,
    brand?: string | null,
    manager?: EntityManager,
  ): Promise<Lens> {
    const sanitized = sanitizeExifString(rawExifName);

    const aliasRepo = manager?.getRepository(LensAlias) ?? this.lensAliasRepository;
    const lensRepo = manager?.getRepository(Lens) ?? this.lensRepository;

    const existing = await aliasRepo.findOne({
      where: { rawExifName: sanitized },
      relations: ['lens'],
    });

    if (existing) return existing.lens;

    try {
      const lens = new Lens();
      lens.brand = brand ? sanitizeExifString(brand) : null;
      lens.modelName = sanitized;
      lens.isVerified = false;
      const savedLens = await lensRepo.save(lens);

      const alias = new LensAlias();
      alias.rawExifName = sanitized;
      alias.lens = savedLens;
      await aliasRepo.save(alias);

      return savedLens;
    } catch {
      const retried = await aliasRepo.findOne({
        where: { rawExifName: sanitized },
        relations: ['lens'],
      });
      if (retried) return retried.lens;
      throw new Error('Failed to create lens from EXIF data');
    }
  }

  async getLenses(page: number = 1, limit: number = 20): Promise<LensListResponseDto> {
    const [lenses, total] = await this.lensRepository.findAndCount({
      relations: ['aliases'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = lenses.map((l) =>
      plainToInstance(LensResponseDto, l, { excludeExtraneousValues: true }),
    );

    return plainToInstance(
      LensListResponseDto,
      { lenses: items, total },
      { excludeExtraneousValues: true },
    );
  }

  async getUnverifiedLenses(page: number = 1, limit: number = 20): Promise<LensListResponseDto> {
    const [lenses, total] = await this.lensRepository.findAndCount({
      where: { isVerified: false },
      relations: ['aliases'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = lenses.map((l) =>
      plainToInstance(LensResponseDto, l, { excludeExtraneousValues: true }),
    );

    return plainToInstance(
      LensListResponseDto,
      { lenses: items, total },
      { excludeExtraneousValues: true },
    );
  }

  async mergeLenses(targetId: number, sourceIds: number[]): Promise<LensResponseDto> {
    const target = await this.lensRepository.findOne({
      where: { id: targetId },
      relations: ['aliases'],
    });

    if (!target) {
      throw new NotFoundException(createError(ErrorCode.LENS_NOT_FOUND));
    }

    const filteredSourceIds = sourceIds.filter((id) => id !== targetId);
    if (filteredSourceIds.length === 0) {
      return plainToInstance(LensResponseDto, target, { excludeExtraneousValues: true });
    }

    return await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(LensAlias)
        .set({ lens: target })
        .where('lensId IN (:...sourceIds)', { sourceIds: filteredSourceIds })
        .execute();

      await manager
        .createQueryBuilder()
        .update(Photo)
        .set({ lens: target })
        .where('lensId IN (:...sourceIds)', { sourceIds: filteredSourceIds })
        .execute();

      await manager.softRemove(
        Lens,
        filteredSourceIds.map((id) => ({ id })),
      );

      const merged = await manager.findOne(Lens, {
        where: { id: targetId },
        relations: ['aliases'],
      });

      return plainToInstance(LensResponseDto, merged, { excludeExtraneousValues: true });
    });
  }
}
