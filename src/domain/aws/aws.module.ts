import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AwsController } from "src/domain/aws/aws.controller";
import { Image } from "src/domain/aws/entity/image.entity";
import { AwsService } from "src/domain/aws/aws.service";

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Image])],
  controllers: [AwsController],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule { }