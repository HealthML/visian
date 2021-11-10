import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/auth.module";
import { TokensModule } from "../tokens/tokens.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    AuthModule,
    TokensModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: "postgres",
        ...(process.env.DATABASE_URL
          ? { url: process.env.DATABASE_URL }
          : {
              host: configService.get<string>("DB_HOST", "127.0.0.1"),
              port: configService.get<number>("DB_PORT", 5432),
              username: configService.get<string>("DB_USER", "postgres"),
              password: configService.get<string>("DB_PASSWORD", "postgres"),
              database: configService.get<string>("DB_SCHEMA", "floy"),
            }),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
