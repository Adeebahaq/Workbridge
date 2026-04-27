import { useState, useEffect } from "react";
import api from "../services/api";
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => { api.get("/notifications").then(setNotifications).catch(() => {}); }, []);
  return { notifications };
}
