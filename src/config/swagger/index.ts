import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule } from "@nestjs/swagger";
import { readFileSync } from "fs";
import * as path from "path";

export const SwaggerSetting = (app: INestApplication) => {
  const swaggerConfig = readFileSync(path.join(__dirname, '../../../swagger.json'), 'utf8');
  const swaggerDocument = JSON.parse(swaggerConfig);
  const configService = app.get(ConfigService);

  swaggerDocument.servers = configService.get('DOMAIN');

  SwaggerModule.setup('', app, swaggerDocument);
};