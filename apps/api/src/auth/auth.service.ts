import { Injectable } from "@nestjs/common";

import { UserEntity } from "../users/user.entity";
import { UsersService } from "../users/users.service";
import { SessionPayload, verifyPassword } from "./utils";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  public async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await verifyPassword(user.password, password))) {
      return user;
    }
    return null;
  }

  /**
   * Returns a session payload for the given user that they can use
   * to authenticate themselve.
   */
  public async logIn(user: UserEntity) {
    return { sub: user.id.toString() } as SessionPayload;
  }
}
