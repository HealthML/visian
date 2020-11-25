import { Injectable } from "@nestjs/common";

import { User } from "../../../../graphql.schema";

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findOneById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }
}
