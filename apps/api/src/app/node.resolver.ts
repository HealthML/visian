import { Resolver } from "@nestjs/graphql";
import {
  NodeFieldResolver,
  NodeInterface,
  ResolvedGlobalId,
} from "nestjs-relay";

import { UserModel } from "../users/user.model";
import { UsersService } from "../users/users.service";

@Resolver(NodeInterface)
export class NodeResolver extends NodeFieldResolver {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async resolveNode(resolvedGlobalId: ResolvedGlobalId): Promise<any> {
    switch (resolvedGlobalId.type) {
      case "User": {
        const user = await this.usersService.findOneById(
          resolvedGlobalId.toString(),
        );
        return user ? new UserModel(user) : null;
      }
      default:
        return null;
    }
  }
}
