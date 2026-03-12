import { BadRequestException, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { createError, ErrorCode } from 'src/common/exception/error';

@Injectable()
export class AdminGuard extends AuthGuard('admin-jwt') {
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (info?.message === 'No auth token') {
      throw new BadRequestException(createError(ErrorCode.NO_AUTH_TOKEN));
    }
    return super.handleRequest(err, user, info, context, status);
  }
}
