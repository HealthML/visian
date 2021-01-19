import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

import { SessionPayload } from "./utils";

export const Session = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.session as SessionPayload;
  },
);
