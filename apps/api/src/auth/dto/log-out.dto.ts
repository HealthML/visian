import { Field, InputType, ObjectType } from "@nestjs/graphql";

@InputType()
export class LogOutInput {}

@ObjectType()
export class LogOutPayload {
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Field()
  public success: boolean = true;
}
