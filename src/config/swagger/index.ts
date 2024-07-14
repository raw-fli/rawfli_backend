import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule } from "@nestjs/swagger";
import { readFileSync } from "fs";
import * as path from "path";

export const SwaggerSetting = (app: INestApplication) => {
  const swaggerConfig = readFileSync(path.join(__dirname, '../../../swagger.json'), 'utf8');
  const swaggerDocument = JSON.parse(swaggerConfig);
  const configService = app.get(ConfigService);

  swaggerDocument.servers.at(0).url = configService.get('DOMAIN');

  SwaggerModule.setup('api/v1/swagger', app, swaggerDocument);
};