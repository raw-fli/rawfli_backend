declare const module: any;

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as compression from 'compression';
import { ValidationError } from 'class-validator';
import { extractConstraints } from './common/utils/utils';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  const config = new DocumentBuilder()
    .setTitle('Rawfli API')
    .setDescription('The Rawfli API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  await app.listen(3000);
}
bootstrap();
