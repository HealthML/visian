import { Field } from "@nestjs/graphql";
import { NodeInterface, NodeType } from "nestjs-relay";

export interface UserDTO {
  id: string;
  email: string;
  name: string;
}

@NodeType()
export class User extends NodeInterface {
  constructor(props: UserDTO) {
    super();
    Object.assign(this, props);
  }

  @Field({ description: "The user's email address." })
  email: string;

  @Field({ description: "The user name displayed in the UI." })
  name: string;

  // The `password` should never be passed to the client.
  // Thus, we do not need to include it in our API.
}
