import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, userType, loading } = useAuth();

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><h2>Loading...</h2></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (userType !== 'ADMIN') return <Navigate to="/admin/login" replace />;

  return children;
};

export default AdminRoute;
