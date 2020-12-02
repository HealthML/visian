import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { GlobalIdScalar } from "nestjs-relay";

import { UsersModule } from "../users/users.module";
import { AppResolver } from "./app.resolver";
import { AppService } from "./app.service";
import { NodeResolver } from "./node.resolver";

@Module({
  imports: [
    UsersModule,
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      useGlobalPrefix: true,
    }),
  ],
  providers: [GlobalIdScalar, AppService, AppResolver, NodeResolver],
})
export class AppModule {}
