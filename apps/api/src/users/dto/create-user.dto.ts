import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsEmail } from "class-validator";

import { UserModel } from "../user.model";

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
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
