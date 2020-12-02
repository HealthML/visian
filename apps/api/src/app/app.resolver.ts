import { Query, Resolver } from "@nestjs/graphql";
import { AppService } from "./app.service";

@Resolver()
export class AppResolver {
  constructor(private appService: AppService) {}

  @Query(() => String, {
    description: "The current API version.",
    name: "version",
  })
  public getVersion() {
    return this.appService.getVersion();
  }
}
