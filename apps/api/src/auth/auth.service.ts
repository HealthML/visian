import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { UserEntity } from "../users/user.entity";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password === password) return user;
    return null;
  }

  /**
   * Returns a JWT for the given user that they can use to
   * authenticate themselve.
   */
  async logIn(user: UserEntity) {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
