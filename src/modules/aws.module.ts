import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AwsController } from "src/controllers/aws.controller";
import { AwsService } from "src/providers/aws.service";

@Module({
  imports: [ConfigModule],
  controllers: [AwsController],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule { }