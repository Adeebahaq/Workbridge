import React from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/layout/Navbar";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [pathname]);
  return null;
}

function AuthGate({ children }) {
  const { loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center text-white text-2xl font-black mx-auto mb-3">W</div>
        <div className="text-teal-600 font-bold text-sm">Loading...</div>
      </div>
    </div>
  );
  return children;
}

function AppShell() {
  return (
    <>
      <ScrollToTop />
      {/* Navbar only shows on public/guest pages — hides itself inside /worker, /employer, /admin */}
      <Navbar />
      <AppRoutes />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGate>
          <AppShell />
        </AuthGate>
      </AuthProvider>
    </BrowserRouter>
  );
}