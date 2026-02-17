import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();

    let errorResponse: any;

    if (typeof exceptionResponse === 'object' && 'code' in exceptionResponse) {
      errorResponse = {
        result: false,
        code: (exceptionResponse as any).code,
        data: (exceptionResponse as any).data,
      };
    } else {
      errorResponse = {
        result: false,
        code: status * 10,
        data: typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message,
      };
    }

    response.status(status).json(errorResponse);
  }
}
