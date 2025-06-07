import { GraphQLClient, gql } from "graphql-request";
import {getAccessToken} from "../auth.js";
import { ApolloClient } from "@apollo/client";

const url = 'http://localhost:9000/graphql';
const client = new GraphQLClient(url, {
  headers: () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      return { 'Authorization': `Bearer ${accessToken}` };
    }
    return {};
  }
});

/*
* job: createJob
* renames 'createJob' -> 'job' in the response
* */
export async function createJob({ title, description }) {
  const mutation = gql`
      mutation CreateJob($input: CreateJobInput!) {
          job: createJob(input: $input) {
              id
          }
      }
  `;

  const { job } = await client.request(mutation, {
    input: { title, description }
  })
  return job;
}

export const getCompany = async function(id) {
  const query = gql`
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

  const data = await client.request(query, { id })
  return data.company;
}

export const getJob = async function(id) {
  const query = gql`
      query JobById($id: ID!) {
          job(id: $id) {
              id
              date
              title
              description
              company {
                id
                name
              }
          }
      }
  `;

  const data = await client.request(query, { id })
  return data.job;
}

export async function getJobs() {
  const query = gql`
    query {
      jobs {
        id
        date
        title
        company {
          id
          name
        }
        description
      }
    }
  `;

  const data = await client.request(query);
  return data.jobs;
}
