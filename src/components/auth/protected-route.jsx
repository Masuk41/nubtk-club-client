import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { LoadingState } from "@/components/shared/loading-state";

export function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingState message="Restoring session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
