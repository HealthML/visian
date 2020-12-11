import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { ResolvedGlobalId } from "nestjs-relay";

@InputType()
export class DeleteUserInput {
  @Field()
  id!: ResolvedGlobalId;
}

@ObjectType()
export class DeleteUserPayload {
  constructor(id: ResolvedGlobalId) {
    this.id = id;
  }

  @Field()
  id: ResolvedGlobalId;
}
