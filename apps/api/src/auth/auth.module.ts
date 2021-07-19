import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { TypeormStore } from "connect-typeorm";
import session from "express-session";
import { Repository } from "typeorm";

import { UsersModule } from "../users/users.module";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { SessionEntity } from "./session.entity";

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([SessionEntity]),
    ConfigModule,
  ],
  providers: [AuthService, AuthResolver],
})
export class AuthModule implements NestModule {
  constructor(
    private configService: ConfigService,
    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
  ) {}
  public configure(consumer: MiddlewareConsumer) {
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
          store: new TypeormStore({ cleanupLimit: 2 }).connect(
            this.sessionRepository,
          ),
        }),
      )
      .forRoutes("*");
  }
}
