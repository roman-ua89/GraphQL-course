import React, { useEffect, useState } from "react";
import JobList from '../components/JobList';
import {useJob, useJobs} from "../lib/graphql/hooks.js";
import PaginationBar from "../components/PaginationBar.jsx";

const JOBS_PER_PAGE = 20

function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { jobs, loading, error } = useJobs(JOBS_PER_PAGE,(currentPage - 1) * JOBS_PER_PAGE);

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="has-text-danger">Data unavailable</div>
  }

  const totalPages = Math.ceil(jobs.totalCount / JOBS_PER_PAGE);

  return (
    <div>
      <h1 className="title">
        Job Board
      </h1>
      {/*<div>*/}
      {/*  <button*/}
      {/*    disabled={currentPage === 1}*/}
      {/*    className="button"*/}
      {/*    onClick={() => {*/}
      {/*    setCurrentPage(currentPage - 1)*/}
      {/*  }}>Prev</button>*/}
      {/*  <span>{`${currentPage} of ${totalPages}`}</span>*/}
      {/*  <button*/}
      {/*    disabled={currentPage === totalPages}*/}
      {/*    className="button"*/}
      {/*    onClick={() => {*/}
      {/*    setCurrentPage(currentPage + 1)*/}
      {/*  }}>Next</button>*/}
      {/*</div>*/}
      <PaginationBar currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      <JobList jobs={jobs.items} />
    </div>
  );
}

export default HomePage;
