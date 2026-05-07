import { useState, useEffect, useCallback } from "react";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import api from "../services/api";

export function useNotifications(role = "worker") {
  const { socket } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);

  const basePath = role === "employer" ? "/employers/notifications" : "/workers/notifications";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(basePath);
      const list = Array.isArray(data) ? data : (data.notifications || []);
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [basePath]);

  useEffect(() => { load(); }, [load]);

  // ✅ socket is from context — re-runs whenever socket becomes available
  useEffect(() => {
    if (!socket) return;

    const handleNew = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on("new_notification", handleNew);
    return () => socket.off("new_notification", handleNew);
  }, [socket]); // <-- key fix: depends on socket, not window._socket

  const markOneRead = async (id) => {
    try {
      await api.patch(`${basePath}/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.patch(`${basePath}/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  return { notifications, unreadCount, loading, markOneRead, markAllRead, reload: load };
}