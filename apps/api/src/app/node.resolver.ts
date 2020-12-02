import { Resolver } from "@nestjs/graphql";
import {
  NodeFieldResolver,
  NodeInterface,
  ResolvedGlobalId,
} from "nestjs-relay";

import { User } from "../users/user.model";
import { UsersService } from "../users/users.service";

@Resolver(NodeInterface)
export class NodeResolver extends NodeFieldResolver {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  resolveNode(resolvedGlobalId: ResolvedGlobalId) {
    switch (resolvedGlobalId.type) {
      case "User": {
        const user = this.usersService.findOneById(resolvedGlobalId.toString());
        return user ? new User(user) : null;
      }
      default:
        return null;
    }
  }
}
