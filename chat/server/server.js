import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import { readFile } from 'node:fs/promises';
import {authMiddleware, decodeToken, handleLogin} from './auth.js';
import { resolvers } from './resolvers.js';
import { WebSocketServer } from "ws";
import { createServer as createHttpServer } from 'node:http';
import { useServer as useWsServer } from 'graphql-ws/use/ws'
import {makeExecutableSchema} from "@graphql-tools/schema";

const PORT = 9000;

const app = express();
// register middleware fn
/*
* Middleware functions are functions that have access to the request object (req),
* the response object (res), and the next middleware function in the application’s request-response cycle
* */
// CORS allows your server to respond to requests from different origins
/*
* express.json(): This is built-in middleware in Express that parses incoming requests with JSON payloads.
* In other words, when a client sends data to your server in JSON format (e.g., in the body of a POST request),
* express.json() automatically parses that JSON data and makes it available in the req.body object.
* */
app.use(cors(), express.json());

app.post('/login', handleLogin);

function getHttpContext({ req }) {
  // project uses express-jwt middleware
  // that automatically sets 'auth' prop
  // if the request includes the token in the authorization header (for http request)
  if (req.auth) {
    return { user: req.auth.sub };
  }
  return {};
}

function getWsContext({ connectionParams }) {
  const accessToken = connectionParams?.accessToken;
  if (accessToken) {
    const payload = decodeToken(accessToken);
    return { user: payload.sub };
  }
  return {}
}

const typeDefs = await readFile('./schema.graphql', 'utf8');
const schema = makeExecutableSchema({ typeDefs, resolvers })
// apolloServer provides the qraphql over http functionality
// but now we need to add support for websockets
const apolloServer = new ApolloServer({ schema });
await apolloServer.start();
app.use('/graphql', authMiddleware, apolloMiddleware(apolloServer, {
  context: getHttpContext,
}));

const httpServer = createHttpServer(app);
// 'server' must be an http instance, because ws connection is started by making a special an http request
const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });
// useWsServer will add the graphql functionality on top of the websocket server
useWsServer({ schema, context: getWsContext }, wsServer);

// normally the http server created automatically when we cal app.listen
// but since we need to access the http server instance we need to create it explicitly using 'node:http'
// app -> httpServer
httpServer.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
