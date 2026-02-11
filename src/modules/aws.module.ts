import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AwsController } from "src/controllers/aws.controller";
import { Image } from "src/models/tables/image.entity";
import { AwsService } from "src/providers/aws.service";

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Image])],
  controllers: [AwsController],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule { }