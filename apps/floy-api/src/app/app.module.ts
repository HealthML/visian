import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TokensModule } from "../tokens/tokens.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    TokensModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST", "127.0.0.1"),
        port: configService.get<number>("DB_PORT", 5432),
        username: configService.get("DB_USER", "postgres"),
        password: configService.get("DB_PASSWORD", "postgres"),
        database: configService.get("DB_SCHEMA", "floy"),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
