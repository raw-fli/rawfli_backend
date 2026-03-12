import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LensesController } from 'src/domain/lens/lens.controller';
import { LensesService } from 'src/domain/lens/lens.service';
import { Lens } from 'src/domain/lens/entity/lens.entity';
import { LensAlias } from 'src/domain/lens/entity/lens-alias.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lens, LensAlias])],
  controllers: [LensesController],
  providers: [LensesService],
  exports: [LensesService],
})
export class LensesModule { }
