import { Logger, UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { User } from "../../../../graphql.schema";
import { FindUsersGuard } from "./users.guards";
import { UsersService } from "./users.service";

@Resolver("User")
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query()
  @UseGuards(FindUsersGuard)
  async findUsers(
    @Args("query")
    query: string,
  ): Promise<User[]> {
    Logger.log(`Query string: ${query}`);
    return this.usersService.findAll();
  }

  @Query("currentUser")
  async getCurrentUser(): Promise<User | undefined> {
    return this.usersService.findOneById("");
  }
}
