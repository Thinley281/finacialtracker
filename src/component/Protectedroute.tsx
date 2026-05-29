// src/component/Protectedroute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext'; // Or however you access user state

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;