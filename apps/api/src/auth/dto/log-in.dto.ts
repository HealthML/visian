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
  constructor(token: string, user: UserModel) {
    this.token = token;
    this.user = user;
  }

  @Field()
  token: string;

  @Field()
  user: UserModel;
}
