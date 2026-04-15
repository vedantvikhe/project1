import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Protects routes that require an authenticated admin.
 * Redirects to /login if no valid token is found.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
