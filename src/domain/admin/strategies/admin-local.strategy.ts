import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AdminService } from 'src/domain/admin/admin.service';
import { DecodedAdminToken } from 'src/domain/admin/entity/admin.entity';
import { createError, ErrorCode } from 'src/common/exception/error';

@Injectable()
export class AdminLocalStrategy extends PassportStrategy(Strategy, 'admin-local') {
  constructor(private readonly adminService: AdminService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<DecodedAdminToken> {
    const admin = await this.adminService.validateAdmin(username, password);

    if (!admin) {
      throw new UnauthorizedException(createError(ErrorCode.INVALID_CREDENTIALS));
    }

    return admin;
  }
}
