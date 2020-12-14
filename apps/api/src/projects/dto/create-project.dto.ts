import { Field, InputType, ObjectType } from "@nestjs/graphql";

import { ProjectModel } from "../project.model";

@InputType()
export class CreateProjectInput {
  @Field()
  name!: string;
}

@ObjectType()
export class CreateProjectPayload {
  constructor(project: ProjectModel) {
    this.project = project;
  }

  @Field()
  project: ProjectModel;
}
