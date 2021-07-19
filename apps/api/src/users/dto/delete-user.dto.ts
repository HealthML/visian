import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { ResolvedGlobalId } from "nestjs-relay";

@InputType()
export class DeleteUserInput {
  @Field()
  public id!: ResolvedGlobalId;
}

@ObjectType()
export class DeleteUserPayload {
  @Field()
  public id: ResolvedGlobalId;

  constructor(id: ResolvedGlobalId) {
    this.id = id;
  }
}
