import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import DashboardLayout from "../components/layout/DashboardLayout";
import WorkerChat from "../pages/worker/Chat";

import Home                  from "../pages/Home";
import Login                 from "../pages/auth/Login";
import WorkerRegister        from "../pages/auth/WorkerRegister";
import EmployerRegister      from "../pages/auth/EmployerRegister";
import WorkerDashboard       from "../pages/worker/Dashboard";
import WorkerProfile         from "../pages/worker/Profile";
import Availability          from "../pages/worker/Availability";
import WorkerNotifications   from "../pages/worker/Notifications";
import FindWorkers           from "../pages/employer/FindWorkers";
import EmployerDashboard     from "../pages/employer/Dashboard";
import JobRequests           from "../pages/employer/JobRequests";
import Chat                  from "../pages/employer/Chat";
import EmployerNotifications from "../pages/employer/Notifications";
import AdminDashboard        from "../pages/admin/Dashboard";
import AboutUs               from "../pages/AboutUs";

function getDashboard(role) {
  if (role === "worker")   return "/worker/dashboard";
  if (role === "employer") return "/employer/dashboard";
  if (role === "admin")    return "/admin/dashboard";
  return "/";
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={getDashboard(user.role)} replace />;
  return children;
}

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={getDashboard(user.role)} replace />;
  if (user.role === "admin") return children;
  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/"         element={<Home />} />
      <Route path="/about-us" element={<AboutUs />} />

      <Route path="/login"             element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register/worker"   element={<GuestRoute><WorkerRegister /></GuestRoute>} />
      <Route path="/register/employer" element={<GuestRoute><EmployerRegister /></GuestRoute>} />

      {/* Worker routes */}
      <Route path="/worker/dashboard"     element={<PrivateRoute role="worker"><WorkerDashboard /></PrivateRoute>} />
      <Route path="/worker/profile"       element={<PrivateRoute role="worker"><WorkerProfile /></PrivateRoute>} />
      <Route path="/worker/availability"  element={<PrivateRoute role="worker"><Availability /></PrivateRoute>} />
      <Route path="/worker/notifications" element={<PrivateRoute role="worker"><WorkerNotifications /></PrivateRoute>} />
      <Route path="/worker/chat"        element={<PrivateRoute role="worker"><WorkerChat /></PrivateRoute>} />
      <Route path="/worker/chat/:jobId" element={<PrivateRoute role="worker"><WorkerChat /></PrivateRoute>} />

      {/* Employer routes */}
      <Route path="/employer/dashboard"      element={<PrivateRoute role="employer"><EmployerDashboard /></PrivateRoute>} />
      <Route path="/employer/workers"        element={<PrivateRoute role="employer"><FindWorkers /></PrivateRoute>} />
      <Route path="/employer/jobs"           element={<PrivateRoute role="employer"><JobRequests /></PrivateRoute>} />
      <Route path="/employer/chat"           element={<PrivateRoute role="employer"><Chat /></PrivateRoute>} />
      <Route path="/employer/chat/:jobId"    element={<PrivateRoute role="employer"><Chat /></PrivateRoute>} />
      <Route path="/employer/notifications"  element={<PrivateRoute role="employer"><EmployerNotifications /></PrivateRoute>} />

      {/* Old redirect: /employer/messages → /employer/chat */}
      <Route path="/employer/messages" element={<Navigate to="/employer/chat" replace />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}