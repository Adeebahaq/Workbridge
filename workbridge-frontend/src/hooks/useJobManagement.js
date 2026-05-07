import { useState } from "react";
import api from "../services/api";
export function useJobManagement() {
  const [jobs, setJobs] = useState([]);
  const fetchJobs  = async () => setJobs(await api.get("/jobs"));
  const sendRequest = async (data) => api.post("/employers/jobs", data);
  const cancelJob   = async (id)   => api.patch(`/employers/jobs/${id}/cancel`);
  const confirmJob  = async (id)   => api.patch(`/employers/jobs/${id}/confirm`);
  const acceptJob   = async (id)   => api.patch(`/workers/jobs/${id}/accept`);
  const rejectJob   = async (id, reason) => api.patch(`/workers/jobs/${id}/reject`, { reason });
  const startJob    = async (id)   => api.patch(`/workers/jobs/${id}/start`);
  const markDone    = async (id)   => api.patch(`/workers/jobs/${id}/done`);
  return { jobs, fetchJobs, sendRequest, cancelJob, confirmJob, acceptJob, rejectJob, startJob, markDone };
}