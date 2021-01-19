import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as session from "express-session";

import { UsersModule } from "../users/users.module";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";

@Module({
  imports: [UsersModule, ConfigModule],
  providers: [AuthService, AuthResolver],
})
export class AuthModule implements NestModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          secret: this.configService.get("COOKIE_SECRET", "tbpa#TSs$Fk9?!Sg"),
          resave: false,
          saveUninitialized: false,
          cookie: {
            sameSite: true,
            secure: this.configService.get("HTTPS", "true") !== "false",
          },
        }),
      )
      .forRoutes("*");
  }
}
