import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createError, ErrorCode } from 'src/common/exception/error';
import { CreateUserDto } from 'src/domain/user/dto/create-user.dto';
import { DecodedUserToken, User } from 'src/domain/user/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

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
