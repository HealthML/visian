import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";

import { UsersModule } from "../users/users.module";
import { AppResolver } from "./app.resolver";
import { AppService } from "./app.service";

@Module({
  imports: [
    UsersModule,
    GraphQLModule.forRoot({
      // TODO: Extract definitions to NX library
      definitions: {
        emitTypenameField: true,
        path: join(process.cwd(), "graphql.schema.ts"),
      },
      installSubscriptionHandlers: true,
      typePaths: ["./**/*.gql"],
      useGlobalPrefix: true,
    }),
  ],
  providers: [AppService, AppResolver],
})
export class AppModule {}
