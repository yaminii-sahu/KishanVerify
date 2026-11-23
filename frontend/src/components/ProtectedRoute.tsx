import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: Role;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isAuthReady, role } = useAuth();
  const location = useLocation();

  // Wait for auth initialization from storage before making redirect decisions
  if (!isAuthReady) {
    return (
      <div className="min-h-[100dvh] bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  // Not authenticated -> redirect to login remembering the intended URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check if required
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin' : '/farmer'} replace />;
  }

  return children;
};
