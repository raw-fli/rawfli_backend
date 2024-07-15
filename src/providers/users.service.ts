import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EMAIL_ALREADY_CREATED } from 'src/config/errors/error';
import { CreateUserDto } from 'src/models/dtos/create-user.dto';
import { DecodedUserToken, User } from 'src/models/tables/user.entity';
import { Repository } from 'typeorm';
import typia from 'typia';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) { }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<User | EMAIL_ALREADY_CREATED> {
    const alreadyCreatedEmail = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (alreadyCreatedEmail) {
      return typia.random<EMAIL_ALREADY_CREATED>();
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
