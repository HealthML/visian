import { Field, InputType, ObjectType } from "@nestjs/graphql";

import { UserModel } from "../../users/user.model";

@InputType()
export class LogInInput {
  @Field()
  public email!: string;

  @Field()
  public password!: string;
}

@ObjectType()
export class LogInPayload {
  @Field()
  public user: UserModel;

  constructor(user: UserModel) {
    this.user = user;
  }
}
