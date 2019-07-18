
import startServer, {
  modifyArgs,
} from "@prisma-cms/server";

import Module from "../";


const module = new Module({
});

const resolvers = module.getResolvers();


startServer({
  typeDefs: 'src/schema/generated/api.graphql',
  resolvers,
  contextOptions: {
    modifyArgs,
    resolvers,
  },
});
