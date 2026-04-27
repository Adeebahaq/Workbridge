import { useState } from "react";
import api from "../services/api";
export function useOTP() {
  const [loading, setLoading] = useState(false);
  const verify = async (phone, otp) => { setLoading(true); try { return await api.post("/auth/verify-otp", { phone, otp }); } finally { setLoading(false); } };
  return { verify, loading };
}
