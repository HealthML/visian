import { Logger, UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { GlobalIdFieldResolver } from "nestjs-relay";

import { User } from "./user.model";
import { FindUsersGuard } from "./users.guards";
import { UsersService } from "./users.service";

@Resolver(() => User)
export class UsersResolver extends GlobalIdFieldResolver(User) {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  @Query(() => [User], {
    description: `Returns all users that match the given query string.

If no query string is given, returns suggestions based on the user that is currently logged in.`,
  })
  @UseGuards(FindUsersGuard)
  async findUsers(
    @Args("query", { nullable: true })
    query: string,
  ) {
    Logger.log(`Query string: ${query}`);
    return this.usersService.findAll();
  }

  @Query(() => User, {
    description: "Returns the user that is currently logged in (if any).",
    name: "currentUser",
    nullable: true,
  })
  async getCurrentUser() {
    return this.usersService.findOneById("1");
  }
}
