import { GraphQLDefinitionsFactory } from "@nestjs/graphql";
import { join } from "path";

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  emitTypenameField: true,
  path: join(process.cwd(), "graphql.schema.ts"),
  typePaths: ["./app/**/*.gql"],
  watch: false,
});
