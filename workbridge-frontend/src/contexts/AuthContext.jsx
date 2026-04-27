import React, { createContext, useState, useEffect, useCallback } from "react";
import { getToken, setToken, removeToken } from "../utils/token";

export const AuthContext = createContext(null);

// =========================
// Decode JWT safely
// =========================
function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

// =========================
// Token validation
// =========================
function isTokenValid(payload) {
  return payload && payload.exp && Date.now() / 1000 < payload.exp;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD USER ON APP START
  // =========================
  useEffect(() => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    const payload = decodeToken(token);

    if (!isTokenValid(payload)) {
      removeToken();
      localStorage.removeItem("wb_user");
      setUser(null);
      setLoading(false);
      return;
    }

    const cached = localStorage.getItem("wb_user");
    const cachedUser = cached ? JSON.parse(cached) : {};

    const userData = {
      ...payload,
      ...cachedUser,
      role: payload.role || cachedUser.role || "worker", // 🔥 SAFE ROLE FIX
    };

    setUser(userData);
    setLoading(false);
  }, []);

  // =========================
  // LOGIN FUNCTION
  // =========================
  const login = useCallback((token, extraData = {}) => {
    setToken(token);

    const payload = decodeToken(token);

    const fullUser = {
      ...payload,
      ...extraData,
      role: payload.role || extraData.role || "worker", // 🔥 SAFE ROLE FIX
    };

    setUser(fullUser);
    localStorage.setItem("wb_user", JSON.stringify(fullUser));
  }, []);

  // =========================
  // LOGOUT FUNCTION
  // =========================
  const logout = useCallback(() => {
    removeToken();
    localStorage.removeItem("wb_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}