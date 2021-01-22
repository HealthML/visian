import { Field, InputType, ObjectType } from "@nestjs/graphql";

import { UserModel } from "../../users/user.model";

@InputType()
export class LogInInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@ObjectType()
export class LogInPayload {
  constructor(user: UserModel) {
    this.user = user;
  }

  @Field()
  user: UserModel;
}
