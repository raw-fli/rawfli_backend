declare const module: any;

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as compression from 'compression';
import { ValidationError } from 'class-validator';
import { extractConstraints } from './common/utils/utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(compression());
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors) => {
      const message = errors.map((error: ValidationError) => {
        return extractConstraints(error);
      }).join(', ');
      return new BadRequestException(message);
    },
    whitelist: true,
    transform: true,
  }));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  await app.listen(3000);
}
bootstrap();
