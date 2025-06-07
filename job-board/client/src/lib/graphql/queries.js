import {getAccessToken} from "../auth.js";
import {ApolloClient, concat, InMemoryCache, gql, createHttpLink, ApolloLink} from "@apollo/client";

const url = 'http://localhost:9000/graphql';

const httpLink = createHttpLink({ uri: url });
const authLink = new ApolloLink((operation, forward) => {
  // console.log('[authLink] operation:', operation);
  const accessToken = getAccessToken();
    if (accessToken) {
      operation.setContext({
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
    }
  return forward(operation); // this should forward the operation to the next link
})

export const apolloClient = new ApolloClient({
  // order is important
  // we want authLink to be called first
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(), // READ: Supported fetch policies
  // defaultOptions: {
  //   query: {
  //     fetchPolicy: 'network-only',
  //   },
  //   watchQuery: {
  //     fetchPolicy: 'network-only'
  //   }
  // }
});

/*
* job: createJob
* renames 'createJob' -> 'job' in the response
* */

//  fragments are useful to extract a group of fields to a reusable part
const jobDetailFragment = gql`
  fragment JobDetail on Job {
      id
      date
      title
      description
      company {
          id
          name
      }
  }
`

export const companyByIdQuery = gql`
   query companyById($id: ID!) {
       company(id: $id) {
           id
           name
           description
           jobs {
               id
               date
               title
           }
       }
   }
`

export const jobsQuery = gql`
   query Jobs($limit: Int, $offset: Int) {
       jobs(limit: $limit, offset: $offset) {
           items {
               id
               date
               title
               description
               company {
                   id
                   name
               }
           }
           totalCount
       }
   }
`;

export const createJobMutation = gql`
     mutation CreateJob($input: CreateJobInput!) {
         job: createJob(input: $input) {
             ...JobDetail
         }
     }
     ${jobDetailFragment}
 `;

export const jobByIdQuery = gql`
   query JobById($id: ID!) {
       job(id: $id) {
           ...JobDetail
       }
   }
#   fragment definition
   ${jobDetailFragment}
`;
