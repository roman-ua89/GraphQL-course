import React, {useEffect, useState} from "react";
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/formatters';
import {getJob} from "../lib/graphql/queries.js";

function JobPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState();

  useEffect(() => {
    getJob(jobId).then(setJob)
  }, [jobId]);

  if (!job) {
    return <div>Loading...</div>
  }

  console.log(job)


  return (
    <div>
      <h1 className="title is-2">
        {job.title}
      </h1>
      <h2 className="subtitle is-4">
        <Link to={`/companies/${job.company.id}`}>
          {job.company.name}
        </Link>
      </h2>
      <div className="box">
        <div className="block has-text-grey">
          Posted: {job.date}
        </div>
        <p className="block">
          {job.description}
        </p>
      </div>
    </div>
  );
}

export default JobPage;
