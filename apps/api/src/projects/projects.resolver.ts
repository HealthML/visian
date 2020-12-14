import { Logger } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { GlobalIdFieldResolver, InputArg, RelayMutation } from "nestjs-relay";

import {
  CreateProjectInput,
  CreateProjectPayload,
} from "./dto/create-project.dto";
import {
  DeleteProjectInput,
  DeleteProjectPayload,
} from "./dto/delete-project.dto";
import { ProjectModel } from "./project.model";
import { ProjectsService } from "./projects.service";

@Resolver(() => ProjectModel)
export class ProjectsResolver extends GlobalIdFieldResolver(ProjectModel) {
  constructor(private readonly projectsService: ProjectsService) {
    super();
  }

  @RelayMutation(() => CreateProjectPayload)
  async createProject(
    @InputArg(() => CreateProjectInput) input: CreateProjectInput,
  ) {
    return new CreateProjectPayload(
      new ProjectModel(await this.projectsService.create(input)),
    );
  }

  @RelayMutation(() => DeleteProjectPayload)
  async deleteProject(
    @InputArg(() => DeleteProjectInput) input: DeleteProjectInput,
  ) {
    await this.projectsService.remove(input.id.toString());
    return new DeleteProjectPayload(input.id);
  }

  @Query(() => [ProjectModel], {
    description: `Returns all projects that match the given query string.\n
If no query string is given, returns suggestions based on the user that is currently logged in.`,
  })
  async findProjects(
    @Args("query", { nullable: true })
    query: string,
  ): Promise<ProjectModel[]> {
    Logger.log(`Query string: ${query}`);
    const projects = await this.projectsService.findAll();
    return projects
      .filter((project) => project)
      .map((project) => new ProjectModel(project));
  }
}
