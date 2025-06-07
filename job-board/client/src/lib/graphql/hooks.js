import { useMutation, useQuery } from "@apollo/client";
import {companyByIdQuery, createJobMutation, jobByIdQuery, jobsQuery} from "./queries.js";

export function useCompany(id) {
  const { data, loading, error } = useQuery(companyByIdQuery, {
    variables: {
      id
    }
  })
  return { company: data?.company, loading, error: Boolean(error) }
}

export function useJob(id) {
  const { data, loading, error } = useQuery(jobByIdQuery, {
    variables: {
      id
    }
  })
  return { job: data?.job, loading, error: Boolean(error) }
}

export function useJobs(limit, offset) {
  const { data, loading, error } = useQuery(jobsQuery, {
    fetchPolicy: 'network-only',
    variables: {
      limit,
      offset,
    }
  })
  return { jobs: data?.jobs, loading, error: Boolean(error) }
}

export function useCreateJob() {
  const [mutate, { loading }] = useMutation(createJobMutation);

  const createJob = async (title, description) => {
    const { data: { job } } = await mutate({
      variables: { input: { title, description }},
      update: (cache, { data }) => {
        // writing a data returned by a mutation directly to the cache
        // as if it was returned by the 'jobByIdQuery' for this specific jobId
        // before: create new job -> two requests
        // after: one req
        cache.writeQuery({
          query: jobByIdQuery,
          variables: {
            id: data.job.id,
          },
          data,
        })
      }
    })
    return job;
  }

  return { loading, createJob }
}
