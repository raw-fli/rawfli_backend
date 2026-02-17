import { Strategy } from "passport-local";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { DecodedUserToken } from "src/domain/user/entity/user.entity";
import { createError, ErrorCode } from "src/common/exception/error";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<DecodedUserToken> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException(createError(ErrorCode.INVALID_CREDENTIALS));
    }

    return user;
  }
}