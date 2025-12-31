import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AwsController } from "src/controllers/aws.controller";
import { Photo } from "src/models/tables/photo.entity";
import { AwsService } from "src/providers/aws.service";

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Photo])],
  controllers: [AwsController],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule { }