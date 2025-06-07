import { ApolloClient, ApolloLink, concat, createHttpLink, InMemoryCache, split } from '@apollo/client';
import { getAccessToken } from '../auth';
import {Kind, OperationTypeNode} from "graphql";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient as createWsClient } from "graphql-ws";
import {getMainDefinition} from "@apollo/client/utilities";

const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
  }
  return forward(operation);
});

const httpLink = concat(authLink, createHttpLink({ uri: 'http://localhost:9000/graphql' }));

const wsLink = new GraphQLWsLink(createWsClient({
  url: 'ws://localhost:9000/graphql',
  // adds parameters to connection_init
  // this way the accessToken value will be set dynamically when the websocket connection is initiated
  // which may be after the user submitted the login form
  // So we can be sure that the token will have been set by then.
  connectionParams: () => ({ accessToken: getAccessToken() })
}))

export const apolloClient = new ApolloClient({
  // configure ApolloClient to use WS link for Subscriptions
  // but keep using the httpLink for queries and mutations
  link: split(isSubscription, wsLink, httpLink),
  cache: new InMemoryCache(),
});

function isSubscription(operation) {
  const definition =  getMainDefinition(operation.query)
  return definition.kind === Kind.OPERATION_DEFINITION && definition.operation === OperationTypeNode.SUBSCRIPTION;
}
