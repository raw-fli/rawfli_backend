import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DecodedUserToken } from 'src/models/tables/user.entity';
import { UsersService } from 'src/providers/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(
    email: string,
    password: string,
  ): Promise<DecodedUserToken | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      const isRightPass = await bcrypt.compare(password, user.password);
      if (isRightPass) {
        const { password, ...rest } = user;
        return rest;
      }
    }
    return null;
  }

  userLogin(user: DecodedUserToken) {
    const token = this.jwtService.sign({ ...user });
    return token;
  }
}
