import { Field } from "@nestjs/graphql";
import { NodeInterface, NodeType } from "nestjs-relay";

import { ProjectEntity } from "./project.entity";

@NodeType("Project")
export class ProjectModel extends NodeInterface {
  constructor(props: ProjectEntity) {
    super();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.id = props.id as any;
    this.name = props.name;
  }

  @Field()
  name: string;
}
