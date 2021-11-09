import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TokenEntity } from "./token.entity";
import { TokensController } from "./tokens.controller";
import { TokensService } from "./tokens.service";

@Module({
  imports: [TypeOrmModule.forFeature([TokenEntity])],
  controllers: [TokensController],
  exports: [TokensService],
  providers: [TokensService],
})
export class TokensModule {}
