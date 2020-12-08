import { Field, ObjectType } from "@nestjs/graphql";

import { UserModel } from "../user.model";

@ObjectType()
export class CreateUserOutput {
  constructor(user: UserModel) {
    this.user = user;
  }

  @Field()
  user: UserModel;
}
