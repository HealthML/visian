import { Logger } from "@nestjs/common";
import { Resolver } from "@nestjs/graphql";
import {
  NodeFieldResolver,
  NodeInterface,
  ResolvedGlobalId,
} from "nestjs-relay";

import { ProjectModel } from "../projects/project.model";
import { ProjectsService } from "../projects/projects.service";
import { UserModel } from "../users/user.model";
import { UsersService } from "../users/users.service";

@Resolver(NodeInterface)
export class NodeResolver extends NodeFieldResolver {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async resolveNode(resolvedGlobalId: ResolvedGlobalId): Promise<any> {
    switch (resolvedGlobalId.type) {
      case "Project": {
        const project = await this.projectsService.findOneById(
          resolvedGlobalId.toString(),
        );
        return project ? new ProjectModel(project) : null;
      }
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
