import { Logger, UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { GlobalIdFieldResolver, InputArg, RelayMutation } from "nestjs-relay";

import { Session } from "../auth/auth.decorators";
import { GqlAuthGuard } from "../auth/auth.guards";
import type { SessionPayload } from "../auth/utils";
import { CreateUserInput, CreateUserPayload } from "./dto/create-user.dto";
import { DeleteUserInput, DeleteUserPayload } from "./dto/delete-user.dto";
import { UserModel } from "./user.model";
import { UsersService } from "./users.service";

@Resolver(() => UserModel)
export class UsersResolver extends GlobalIdFieldResolver(UserModel) {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  @RelayMutation(() => CreateUserPayload)
  public async createUser(
    @InputArg(() => CreateUserInput) input: CreateUserInput,
  ) {
    return new CreateUserPayload(
      new UserModel(await this.usersService.create(input)),
    );
  }

  @RelayMutation(() => DeleteUserPayload)
  public async deleteUser(
    @InputArg(() => DeleteUserInput) input: DeleteUserInput,
  ) {
    await this.usersService.remove(input.id.toString());
    return new DeleteUserPayload(input.id);
  }

  @Query(() => [UserModel], {
    description: `Returns all users that match the given query string.\n
If no query string is given, returns suggestions based on the user that is currently logged in.`,
  })
  public async findUsers(
    @Args("query", { nullable: true })
    query: string,
  ): Promise<UserModel[]> {
    Logger.log(`Query string: ${query}`);
    const users = await this.usersService.findAll();
    return users.filter((user) => user).map((user) => new UserModel(user));
  }

  @Query(() => UserModel, {
    description: "Returns the user that is currently logged in (if any).",
    name: "currentUser",
    nullable: true,
  })
  @UseGuards(GqlAuthGuard)
  public async getCurrentUser(
    @Session() session: SessionPayload,
  ): Promise<UserModel | null> {
    const user = await this.usersService.findOneById(session.sub);
    return user ? new UserModel(user) : null;
  }
}
