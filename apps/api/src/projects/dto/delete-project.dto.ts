import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { ResolvedGlobalId } from "nestjs-relay";

@InputType()
export class DeleteProjectInput {
  @Field()
  id!: ResolvedGlobalId;
}

@ObjectType()
export class DeleteProjectPayload {
  constructor(id: ResolvedGlobalId) {
    this.id = id;
  }

  @Field()
  id: ResolvedGlobalId;
}
