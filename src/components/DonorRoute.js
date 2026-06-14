import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DonorRoute = ({ children }) => {
  const { isAuthenticated, userType, loading } = useAuth();

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><h2>Loading...</h2></div>;
  if (!isAuthenticated) return <Navigate to="/donor/login" replace />;
  if (userType === 'NEEDY') return <Navigate to="/needy/dashboard" replace />;
  if (userType === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (userType !== 'DONOR') return <Navigate to="/donor/login" replace />;

  return children;
};

export default DonorRoute;
