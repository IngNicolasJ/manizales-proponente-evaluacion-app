
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - loading:', loading, 'user:', user?.email || 'none');

  // Show loading only while actually loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // If not loading and no user, redirect to auth
  if (!loading && !user) {
    console.log('ProtectedRoute: No user found, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated, render children
  console.log('ProtectedRoute: User authenticated, rendering app');
  return <>{children}</>;
};

export default ProtectedRoute;
