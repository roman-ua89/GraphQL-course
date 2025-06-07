import { ApolloServer } from "@apollo/server";
import { expressMiddleware as apolloMiddleware } from "@apollo/server/express4";
import cors from 'cors';
import express from 'express';
import { authMiddleware, handleLogin } from './auth.js';
import { readFile } from 'node:fs/promises';
import { resolvers } from "./resolvers.js";
import {getUser} from "./db/users.js";
import {createCompanyLoader} from "./db/companies.js";

const PORT = 9000;

const app = express();
app.use(cors(), express.json(), authMiddleware);

app.post('/login', handleLogin);

const typeDefs = await readFile('./schema.graphql', 'utf-8');

async function getContext({ req }) {
  // console.log('req.auth', req.auth)
  // create new instance for every request
  // in this way each request will use its own separate cache
  // and you can be sure your clients will receive the latest data
  // We no longer have a global cache which remembers the data from prev request
  // this is the best approach to make sure request gets the fresh data
  const companyLoader = createCompanyLoader();
  const context = { companyLoader };
  if (req.auth) {
    context.user = await getUser(req.auth.sub);
  }
  return context;
}

const apolloServer = new ApolloServer({ typeDefs, resolvers })
await apolloServer.start();
app.use('/graphql', apolloMiddleware(apolloServer, {
  // pass data to resolver
  context: getContext
}));

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Endpoint: localhost:${PORT}/graphql`)
});
