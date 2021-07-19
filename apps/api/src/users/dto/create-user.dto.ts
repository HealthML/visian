import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsEmail } from "class-validator";

import { UserModel } from "../user.model";

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  public email!: string;

  @Field()
  public name!: string;

  @Field()
  public password!: string;
}

@ObjectType()
export class CreateUserPayload {
  @Field()
  public user: UserModel;

  constructor(user: UserModel) {
    this.user = user;
  }
}
