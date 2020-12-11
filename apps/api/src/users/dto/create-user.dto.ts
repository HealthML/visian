import { Field, InputType, ObjectType } from "@nestjs/graphql";

import { UserModel } from "../user.model";

@InputType()
export class CreateUserInput {
  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field()
  password!: string;
}

@ObjectType()
export class CreateUserPayload {
  constructor(user: UserModel) {
    this.user = user;
  }

  @Field()
  user: UserModel;
}
