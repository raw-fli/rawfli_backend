import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './auth/common/filters/http-exception.filter';
import * as compression from 'compression';
import { ValidationError } from 'class-validator';
import { extractConstraints } from './utils/utils';
import { SwaggerSetting } from './config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(compression());
  app.enableCors();

  SwaggerSetting(app);

  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors) => {
      const message = errors.map((error: ValidationError) => {
        if (error.constraints && error.children)
          return [
            ...Object.values(error.constraints),
            ...extractConstraints(error),
          ];
        if (error.children) return extractConstraints(error);
        if (error.constraints) return Object.values(error.constraints);
      }).join(', ');
      return new BadRequestException(message);
    },
    whitelist: true,
    transform: true,
  }));

  await app.listen(3000);
}
bootstrap();
