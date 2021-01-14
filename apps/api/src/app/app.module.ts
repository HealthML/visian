import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GlobalIdScalar } from "nestjs-relay";

import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { AppResolver } from "./app.resolver";
import { AppService } from "./app.service";
import { NodeResolver } from "./node.resolver";

@Module({
  imports: [
    AuthModule,
    UsersModule,
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
        database: configService.get("DB_SCHEMA", "classifai"),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      useGlobalPrefix: true,
    }),
  ],
  providers: [GlobalIdScalar, AppService, AppResolver, NodeResolver],
})
export class AppModule {}
