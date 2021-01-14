import { UnauthorizedException } from "@nestjs/common";
import { Resolver } from "@nestjs/graphql";
import { InputArg, RelayMutation } from "nestjs-relay";
import { UserModel } from "../users/user.model";

import { AuthService } from "./auth.service";
import { LogInInput, LogInPayload } from "./dto/log-in.dto";

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @RelayMutation(() => LogInPayload)
  async logIn(@InputArg(() => LogInInput) input: LogInInput) {
    const user = await this.authService.validateUser(
      input.email,
      input.password,
    );
    if (!user) throw new UnauthorizedException();
    return new LogInPayload(
      await this.authService.logIn(user),
      new UserModel(user),
    );
  }
}
