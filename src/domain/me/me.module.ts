import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domain/user/entity/user.entity';
import { MeController } from './me.controller';
import { MeService } from './me.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
