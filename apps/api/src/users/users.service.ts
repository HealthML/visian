import { Injectable } from "@nestjs/common";

import { UserDTO } from "./user.model";

@Injectable()
export class UsersService {
  private readonly users: UserDTO[] = [
    { id: "1", email: "test@example.com", name: "Demo User" },
    { id: "2", email: "test2@example.com", name: "Demo User 2" },
  ];

  findAll() {
    return this.users;
  }

  findOneById(id: string) {
    return this.users.find((user) => user.id === id);
  }
}
