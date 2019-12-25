

import {
  modifyArgs,
  PrismaCmsServer,
} from '@prisma-cms/server'

import fs from 'fs'

import CoreModule from '../'

const coreModule = new CoreModule({
})

const {
  Query,
  ...otherResolvers
} = coreModule.getResolvers()


const resolvers = {
  ...otherResolvers,
  Query: {
    ...Query,

    apiSchema: () => {
      const schemaFile = 'src/schema/generated/api.graphql'

      let baseSchema = ''

      if (fs.existsSync(schemaFile)) {
        baseSchema = fs.readFileSync(schemaFile, 'utf-8')
      }
      // else {
      //   console.log("file not exists");
      // }

      return baseSchema
    }
  },
}


class PrismaCmsServerCustom extends PrismaCmsServer {

  // getServer() {
  //   const server = super.getServer();
  //   return server;
  // }


  // processRequest(request) {

  //   return super.processRequest({
  //     ...request,
  //   });
  // }

}


const startServer = function (options) {
  return new PrismaCmsServerCustom(options).startServer()
}


startServer({
  typeDefs: 'src/schema/generated/api.graphql',
  resolvers,
  contextOptions: {
    modifyArgs,
    resolvers,
  },
})


