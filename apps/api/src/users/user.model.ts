import { Field } from "@nestjs/graphql";
import { NodeInterface, NodeType } from "nestjs-relay";

import { UserEntity } from "./user.entity";

@NodeType("User")
export class UserModel extends NodeInterface {
  constructor(props: UserEntity) {
    super();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.id = props.id as any;
    this.email = props.email;
    this.name = props.name;
  }

  @Field({ description: "The user's email address." })
  email: string;

  @Field({ description: "The user name displayed in the UI." })
  name: string;

  // The `password` should never be passed to the client.
  // Thus, we do not need to include it in our API.
}
