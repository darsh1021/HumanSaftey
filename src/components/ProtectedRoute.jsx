import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-accent-blue animate-spin mb-4" />
        <span className="font-mono text-xs tracking-widest text-white/50 animate-pulse">VERIFYING AUTHENTICATION</span>
      </div>
    );
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to their main dashboard or a 403 page
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
