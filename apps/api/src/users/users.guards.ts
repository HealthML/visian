import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class FindUsersGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const { query } = ctx.getArgs();
    return query !== "";
  }
}
