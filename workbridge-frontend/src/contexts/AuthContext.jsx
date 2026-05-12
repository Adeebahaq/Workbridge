import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";

export const AuthContext = createContext(null);

function decodeToken(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
}

function isTokenValid(payload) {
  return payload && payload.exp && Date.now() / 1000 < payload.exp;
}

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket,  setSocket]  = useState(null);
  const socketRef             = useRef(null);

  const connectSocket = useCallback((token) => {
    if (socketRef.current) socketRef.current.disconnect();
    const s = io(SOCKET_URL, { auth: { token }, transports: ["websocket"] });
    socketRef.current = s;
    setSocket(s);
  }, []);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
    setSocket(null);
  }, []);

  useEffect(() => {
    // ✅ sessionStorage is per-tab — stores which token this tab is using
    const token = sessionStorage.getItem("wb_token");

    if (!token) { setLoading(false); return; }

    const payload = decodeToken(token);
    if (!isTokenValid(payload)) {
      sessionStorage.removeItem("wb_token");
      setUser(null); setLoading(false); return;
    }

    setUser({ ...payload });
    connectSocket(token);
    setLoading(false);
  }, []);

  const login = useCallback((token, extraData = {}) => {
    const payload  = decodeToken(token);
    const fullUser = { ...payload, ...extraData, role: payload?.role || extraData.role || "worker" };

    // ✅ Save in sessionStorage (this tab only) AND localStorage (for API interceptor)
    sessionStorage.setItem("wb_token", token);
    localStorage.setItem("wb_token", token);

    setUser(fullUser);
    connectSocket(token);
  }, [connectSocket]);

  const logout = useCallback(() => {
    sessionStorage.removeItem("wb_token");
    localStorage.removeItem("wb_token");
    localStorage.removeItem("wb_user");
    setUser(null);
    disconnectSocket();
  }, [disconnectSocket]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, socket }}>
      {children}
    </AuthContext.Provider>
  );
}