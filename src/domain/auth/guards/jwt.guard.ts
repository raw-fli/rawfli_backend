import { BadRequestException, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { createError, ErrorCode } from "src/common/exception/error";
import { DecodedUserToken } from "src/domain/user/entity/user.entity";

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  handleRequest<TUser = DecodedUserToken>(
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