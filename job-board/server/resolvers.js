import {getJobs, getJob, getJobsByCompany, createJob, deleteJob, updateJob, countJobs} from "./db/jobs.js";
import { getCompany} from "./db/companies.js";
import { GraphQLError } from "graphql/error/index.js";

export const resolvers = {
  Query: {
    company: async (_root, { id }) => {
      const company =  await getCompany(id);
      if (!company) {
        throw notFoundError('No company with id: ' + id);
      }
      return company;
    },
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) {
        throw notFoundError('Job with id: ' + id + ' not found')
      }
      return job;
    },
    jobs: async (_root, { limit, offset }) => {
      const items = await getJobs(limit, offset);
      const totalCount = await countJobs();
      return { items, totalCount }
    }
  },

  Mutation: {
    // second param is 'args'
    // third: obj, where we can put anything we want
    // and make it available to resolvers
    createJob: (_root, { input: { title, description } }, context) => {
      const { user } = context;
      console.log('user from resolver: ', user)
      if (!user) {
        throw anauthorizedError('Missing authentication');
      }
      // return null;
      const { companyId } = user;
      return createJob({ companyId, title, description })
    },
    deleteJob: async (_root, { id }, { user }) => {
      if (!user) {
        throw anauthorizedError('Missing authentication');
      }
      const job = await deleteJob(id, user.companyId);
      if (!job) {
        throw notFoundError('Job with id: ' + id + ' not found')
      }
      return job;
    },
    updateJob: async (_root, { input: { id, title, description } }, { user }) => {
      if (!user) {
        throw anauthorizedError('Missing authentication');
      }
      const job = await updateJob({ id, companyId: user.companyId, title, description })
      if (!job) {
        throw notFoundError('Job with id: ' + id + ' not found');
      }
      return job;
    },
  },

  Company: {
    jobs: (company) => getJobsByCompany(company.id)
  },

  Job: {
    // without batching
    // company: (job) => getCompany(job.companyId),
    company: (job, _args, { companyLoader }) => {
      return companyLoader.load(job.companyId)
    },
    date: (job) => toIsoDate(job.createdAt),
  }
}

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND' }
  })
}

function anauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHORIZED' }
  })
}

function toIsoDate(value) {
  return value.slice(0, 'yyyy-mm-dd'.length);
}
