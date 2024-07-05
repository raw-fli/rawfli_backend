import { INestiaConfig } from '@nestia/sdk';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';

const NESTIA_CONFIG: INestiaConfig = {
  input: async () => {
    const app = await NestFactory.create(AppModule);
    return app;
  },
  output: 'src/api',
  distribute: 'packages/api',
  swagger: {
    output: 'dist/swagger.json',
  },
};

export default NESTIA_CONFIG;
