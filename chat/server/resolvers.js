import { GraphQLError } from 'graphql';
import { createMessage, getMessages } from './db/messages.js';
import {PubSub} from "graphql-subscriptions";

// PubSub stands for Publish and Subscribe
// it's a common pattern for messaging systems
// PubSub is not recommended for production https://www.apollographql.com/docs/apollo-server/data/subscriptions#the-pubsub-class
const pubSub = new PubSub();

export const resolvers = {
  Query: {
    // _root or 'parent' represents the result from the previous resolver in the execution chain.
    // Since messages is a top-level query in the Query type, it's a root field.
    // Therefore, _root will typically be null or undefined. There's no parent resolver providing data to it.

    // _args: This is an object containing any arguments passed to the messages query in the GraphQL request.
    messages: (_root, _args, { user }) => {
      if (!user) throw unauthorizedError();
      return getMessages();
    },
  },

  Mutation: {
    addMessage: async (_root, { text }, { user }) => {
      if (!user) throw unauthorizedError();
      const message = await createMessage(user, text);
      // 1 param - a trigger name
      // 2 arg - obj. Whenever we publish from here, will be received by all the clients that subscribed to the 'messageAdded' subscription
      pubSub.publish('MESSAGE_ADDED', { messageAdded: message });
      return message;
    },
  },
  // s*n don't return a single value like Query and Mutation
  // instead, they notify client whenever an event occurs
  Subscription: {
    messageAdded: {
      // _root - parent obj
      subscribe: (_root, _args, { user }) => {
        // {user} - taking a value here is the last step
        // previously we created getWsContext()
        if (!user) throw unauthorizedError();
        return pubSub.asyncIterableIterator('MESSAGE_ADDED');
      },
    }
  }
};

function unauthorizedError() {
  return new GraphQLError('Not authenticated', {
    extensions: { code: 'UNAUTHORIZED' },
  });
}
