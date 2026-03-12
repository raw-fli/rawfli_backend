import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/domain/user/entity/user.entity';
import { createError, ErrorCode } from 'src/common/exception/error';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { MeResponseDto } from './dto/me.response.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async getMe(userId: number): Promise<MeResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(createError(ErrorCode.USER_NOT_FOUND));
    }

    return plainToInstance(MeResponseDto, user, { excludeExtraneousValues: true });
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<MeResponseDto> {
    await this.usersRepository.update(userId, dto);
    return this.getMe(userId);
  }

  async updatePassword(userId: number, dto: UpdatePasswordDto): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException(createError(ErrorCode.USER_NOT_FOUND));
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException(createError(ErrorCode.WRONG_PASSWORD));
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.update(userId, { password: hashedPassword });
  }
}
