import { useState } from 'react';
import {createJobMutation, jobByIdQuery} from "../lib/graphql/queries.js";
import {useNavigate} from "react-router";
import {useMutation} from "@apollo/client";
import {useCreateJob} from "../lib/graphql/hooks.js";

function CreateJobPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { createJob, loading } = useCreateJob();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const job = await createJob(title, description)
    console.log('job created:', job);
    navigate(`/jobs/${job.id}`);
  };

  return (
    <div>
      <h1 className="title">
        New Job
      </h1>
      <div className="box">
        <form>
          <div className="field">
            <label className="label">
              Title
            </label>
            <div className="control">
              <input className="input" type="text" value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="label">
              Description
            </label>
            <div className="control">
              <textarea className="textarea" rows={10} value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button
                disabled={loading}
                className="button is-link"
                onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateJobPage;
