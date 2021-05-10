import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class GqlAuthGuard implements CanActivate {
  public canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    if (ctx.getContext().req.session.sub) return true;
    throw new UnauthorizedException();
  }
}
