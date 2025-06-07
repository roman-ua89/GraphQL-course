import {useMutation, useQuery, useSubscription} from '@apollo/client';
import {addMessageMutation, messageAddedSubscription, messagesQuery} from './queries';

export function useAddMessage() {
  const [mutate] = useMutation(addMessageMutation);

  const addMessage = async (text) => {
    const { data: { message } } = await mutate({
      variables: { text },
    });
    return message;
  };

  return { addMessage };
}

export function useMessages() {
  const { data } = useQuery(messagesQuery);
  // start subscription right after the query
  useSubscription(messageAddedSubscription, {
    // listening func which will be called for every notification
    // Data: Allows the registration of a callback function that will be triggered each time the useSubscription Hook / Subscription component receives data.
    onData: ({ client, data }) => {
      // 'data' is graphql result
      const newMessage = data.data.message;
      client.cache.updateQuery({
        // specifies the query whose cache you want to update.
        query: messagesQuery
      }, ({ messages }) => {
        // whenever we receive a new message we add it to the cache
        // and the 'messages' property returned from this hook will update automatically
        // because the data returned by useQuery reflects any changes to the cache
        return { messages: [...messages, newMessage] };
      });
    }
  })

  return {
    messages: data?.messages ?? [],
  };
}
