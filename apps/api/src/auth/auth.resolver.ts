import { UnauthorizedException, UseGuards } from "@nestjs/common";
import { Resolver } from "@nestjs/graphql";
import { Session as SessionType } from "express-session";
import { InputArg, RelayMutation } from "nestjs-relay";

import { UserModel } from "../users/user.model";
import { Session } from "./auth.decorators";
import { GqlAuthGuard } from "./auth.guards";
import { AuthService } from "./auth.service";
import { LogInInput, LogInPayload } from "./dto/log-in.dto";
import { LogOutInput, LogOutPayload } from "./dto/log-out.dto";
import type { SessionPayload } from "./utils";

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @RelayMutation(() => LogInPayload)
  public async logIn(
    @Session() session: SessionPayload,
    @InputArg(() => LogInInput) input: LogInInput,
  ) {
    const user = await this.authService.validateUser(
      input.email,
      input.password,
    );
    if (!user) throw new UnauthorizedException();
    Object.assign(session, await this.authService.logIn(user));
    return new LogInPayload(new UserModel(user));
  }

  @UseGuards(GqlAuthGuard)
  @RelayMutation(() => LogOutPayload)
  public async logOut(
    @Session() session: SessionType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @InputArg(() => LogOutInput) _input: LogOutInput,
  ) {
    await new Promise<void>((resolve, reject) =>
      session.destroy((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }),
    );
    return new LogOutPayload();
  }
}
