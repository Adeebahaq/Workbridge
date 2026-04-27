import { useState } from "react";
import api from "../services/api";
export function useWorkerSearch() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const search = async (filters) => { setLoading(true); try { setWorkers(await api.get("/employers/workers", { params: filters })); } finally { setLoading(false); } };
  return { workers, search, loading };
}
