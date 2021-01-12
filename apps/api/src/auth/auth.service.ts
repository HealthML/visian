import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { UserEntity } from "../users/user.entity";
import { UsersService } from "../users/users.service";
import { JwtPayload, verifyPassword } from "./utils";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  public async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await verifyPassword(user.password, password))) {
      return user;
    }
    return null;
  }

  /**
   * Returns a JWT for the given user that they can use to
   * authenticate themselve.
   */
  public async logIn(user: UserEntity) {
    const payload: JwtPayload = { sub: user.id.toString() };
    return this.jwtService.sign(payload);
  }
}
