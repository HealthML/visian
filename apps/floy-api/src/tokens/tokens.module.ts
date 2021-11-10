import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ConsentEntity } from "./consent.entity";
import { TokenEntity } from "./token.entity";
import { TokensController } from "./tokens.controller";
import { TokensService } from "./tokens.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenEntity]),
    TypeOrmModule.forFeature([ConsentEntity]),
  ],
  controllers: [TokensController],
  exports: [TokensService],
  providers: [TokensService],
})
export class TokensModule {}
