// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 * Props:
 *  - children: component children
 *  - allowedRoles: optional array of roles allowed (e.g. ['teacher'])
 *
 * This version normalizes role and also accepts teacher by demo email fallback.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const auth = useAuth();

  if (!auth || !auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = (auth.user?.role || "").toString().toLowerCase();
    const email = (auth.user?.email || "").toString().toLowerCase();
    const isDemoTeacherEmail = email === "teacher@demo.com";
    const allowed = role && allowedRoles.map(r => r.toLowerCase()).includes(role);

    if (!allowed && !isDemoTeacherEmail) {
      return <div style={{ padding: 24 }}>Access denied — you don't have permission to view this page.</div>;
    }
  }

  return children;
}
