import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AuthProvider, { useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Activities from "./pages/activities";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import Deals from "./pages/Deals";
import Invoices from "./pages/invoices";
import Leads from "./pages/Leads";
import DashboardArtifact from "./pages/DashboardArtifact";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Tasks from "./pages/tasks";
import Team from "./pages/Team";

function AppRoutes() {
  const { user, isLoading } = useAuth();

  // While verifying the session server-side, render nothing (ProtectedRoute shows spinner)
  return (
    <Routes>
      <Route path="/preview" element={<DashboardArtifact />} />
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/"           element={<Dashboard />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/clients"    element={<Clients />} />
        <Route path="/deals"      element={<Deals />} />
        <Route path="/invoices"   element={<Invoices />} />
        <Route path="/leads"      element={<Leads />} />
        <Route path="/projects"   element={<Projects />} />
        <Route path="/tasks"      element={<Tasks />} />
        <Route path="/team"       element={<Team />} />
      </Route>
      {/* Catch-all: redirect based on auth state */}
      <Route
        path="*"
        element={
          isLoading ? null : <Navigate to={user ? "/" : "/login"} replace />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
