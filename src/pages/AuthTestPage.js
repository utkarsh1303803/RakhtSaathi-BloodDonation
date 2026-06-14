import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthTestPage = () => {
  const auth = useAuth();

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔧 Auth Context Test</h1>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h2>Current Auth State:</h2>
        <pre style={{ backgroundColor: '#e9ecef', padding: '15px', borderRadius: '5px' }}>
          {JSON.stringify({
            isAuthenticated: auth.isAuthenticated,
            userType: auth.userType,
            isMockMode: auth.isMockMode,
            user: auth.user ? { uid: auth.user.uid, email: auth.user.email } : null,
            userProfile: auth.userProfile ? { name: auth.userProfile.name, role: auth.userProfile.role } : null
          }, null, 2)}
        </pre>
      </div>

      {auth.isMockMode && (
        <div style={{ 
          backgroundColor: '#d1fae5', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3>✅ Mock Mode Active</h3>
          <p>The application is running in mock mode. Firebase is bypassed.</p>
          
          {!auth.isAuthenticated && (
            <div>
              <h4>Test Mock Login:</h4>
              <button 
                onClick={() => auth.mockLogin('admin@test.com', 'password', 'ADMIN')}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Mock Admin Login
              </button>
            </div>
          )}
          
          {auth.isAuthenticated && (
            <div>
              <h4>Logged in as: {auth.userProfile?.name}</h4>
              <button 
                onClick={() => auth.mockLogout()}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Mock Logout
              </button>
              <a 
                href="/admin/dashboard"
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  marginLeft: '10px'
                }}
              >
                Go to Dashboard
              </a>
            </div>
          )}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <a href="/" style={{ 
          color: '#dc2626', 
          textDecoration: 'none',
          padding: '10px 20px',
          border: '1px solid #dc2626',
          borderRadius: '5px'
        }}>
          ← Back to Home
        </a>
      </div>
    </div>
  );
};

export default AuthTestPage;