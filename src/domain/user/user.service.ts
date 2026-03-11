import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createError, ErrorCode } from 'src/common/exception/error';
import { CreateUserDto } from 'src/domain/user/dto/create-user.dto';
import { DecodedUserToken, User } from 'src/domain/user/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserInfoResponseDto } from './dto/user-info.response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) { }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<User> {
    const alreadyCreatedEmail = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (alreadyCreatedEmail) {
      throw new ConflictException(createError(ErrorCode.EMAIL_ALREADY_CREATED));
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = new User();
    newUser.email = createUserDto.email;
    newUser.username = createUserDto.username;
    newUser.password = hashedPassword;
    return await this.usersRepository.save(newUser);
  }

  async getUserInfo(userId: number): Promise<UserInfoResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['posts', 'followers', 'followings'],
    });

    if (!user) {
      throw new NotFoundException(createError(ErrorCode.USER_NOT_FOUND));
    }

    const dto = plainToInstance(UserInfoResponseDto, user, { excludeExtraneousValues: true });
    dto.followerCount = user.followers?.length ?? 0;
    dto.followingCount = user.followings?.length ?? 0;
    return dto;
  }

  async findOneByEmail(
    email: string,
  ): Promise<(DecodedUserToken & { password: string }) | null> {
    return await this.usersRepository.findOne({
      select: {
        id: true,
        email: true,
        password: true,
      },
      where: {
        email,
      },
    });
  }
}
