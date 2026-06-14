import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModePage = () => {
  const [email, setEmail] = useState('admin@bloodsaathi.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const auth = useAuth();

  const handleMockLogin = async (userType) => {
    setLoading(true);
    setResult(null);
    
    try {
      if (auth.mockLogin) {
        // Using mock auth context
        await auth.mockLogin(email, password, userType);
        setResult({
          success: true,
          message: `Mock ${userType} login successful!`,
          redirect: userType === 'ADMIN' ? '/admin/dashboard' : 
                   userType === 'DONOR' ? '/donor/dashboard' : '/needy/dashboard'
        });
      } else {
        setResult({
          success: false,
          message: 'Mock authentication not available. Using real Firebase context.'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Mock login failed: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      if (auth.mockLogout) {
        await auth.mockLogout();
      }
      setResult({
        success: true,
        message: 'Logged out successfully!'
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Logout failed: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>🔧 Authentication Mode</h1>
        <p>Test authentication when Firebase is not working</p>
      </div>

      {/* Current Status */}
      <div style={{ 
        backgroundColor: auth.isAuthenticated ? '#d1fae5' : '#f3f4f6', 
        padding: '20px', 
        borderRadius: '10px',
        border: `1px solid ${auth.isAuthenticated ? '#059669' : '#d1d5db'}`,
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Current Status</h3>
        <p><strong>Authenticated:</strong> {auth.isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User Type:</strong> {auth.userType || 'None'}</p>
        <p><strong>Email:</strong> {auth.user?.email || 'None'}</p>
        <p><strong>Mock Mode:</strong> {auth.isMockMode ? 'Yes' : 'No'}</p>
        {auth.userProfile && (
          <p><strong>Profile:</strong> {auth.userProfile.fullName}</p>
        )}
      </div>

      {/* Login Form */}
      {!auth.isAuthenticated && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2>🔐 Mock Authentication</h2>
          <p>Use this when Firebase is not working to test the application.</p>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <button 
              onClick={() => handleMockLogin('ADMIN')}
              disabled={loading}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? 'Logging in...' : '👨‍💼 Admin Login'}
            </button>

            <button 
              onClick={() => handleMockLogin('DONOR')}
              disabled={loading}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? 'Logging in...' : '🩸 Donor Login'}
            </button>

            <button 
              onClick={() => handleMockLogin('NEEDY')}
              disabled={loading}
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? 'Logging in...' : '🆘 Needy Login'}
            </button>
          </div>
        </div>
      )}

      {/* Logout and Navigation */}
      {auth.isAuthenticated && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2>🎯 Navigation</h2>
          <p>You are logged in as {auth.userType}. Choose where to go:</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {auth.userType === 'ADMIN' && (
              <button 
                onClick={() => navigateTo('/admin/dashboard')}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                📊 Admin Dashboard
              </button>
            )}

            {auth.userType === 'DONOR' && (
              <button 
                onClick={() => navigateTo('/donor/dashboard')}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🩸 Donor Dashboard
              </button>
            )}

            {auth.userType === 'NEEDY' && (
              <button 
                onClick={() => navigateTo('/needy/dashboard')}
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🆘 Needy Dashboard
              </button>
            )}

            <button 
              onClick={handleLogout}
              disabled={loading}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? 'Logging out...' : '🚪 Logout'}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ 
          backgroundColor: result.success ? '#d1fae5' : '#fecaca', 
          padding: '20px', 
          borderRadius: '10px',
          border: `1px solid ${result.success ? '#059669' : '#dc2626'}`,
          marginBottom: '20px'
        }}>
          <h3 style={{ color: result.success ? '#047857' : '#b91c1c', margin: '0 0 10px 0' }}>
            {result.success ? '✅ Success!' : '❌ Error'}
          </h3>
          <p style={{ margin: '0 0 10px 0' }}>{result.message}</p>
          
          {result.redirect && (
            <button 
              onClick={() => navigateTo(result.redirect)}
              style={{
                backgroundColor: '#7c3aed',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                marginTop: '10px'
              }}
            >
              Go to Dashboard →
            </button>
          )}
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '20px', 
        borderRadius: '10px',
        border: '1px solid #ffeaa7'
      }}>
        <h3 style={{ color: '#856404', margin: '0 0 15px 0' }}>📋 How to Use Mock Authentication</h3>
        <div style={{ color: '#856404' }}>
          <ol style={{ paddingLeft: '20px' }}>
            <li><strong>When Firebase is not working:</strong> Use this page to login with mock credentials</li>
            <li><strong>Choose user type:</strong> Admin, Donor, or Needy based on what you want to test</li>
            <li><strong>Navigate to dashboard:</strong> After login, go to the appropriate dashboard</li>
            <li><strong>Test features:</strong> Most features will work except Firebase-dependent ones</li>
            <li><strong>Switch back:</strong> When Firebase is fixed, use regular login pages</li>
          </ol>
          
          <p style={{ marginTop: '15px' }}><strong>Note:</strong> Mock authentication is for testing only. Data won't be saved to Firebase.</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{ 
            color: '#dc2626', 
            textDecoration: 'none',
            padding: '10px 20px',
            border: '1px solid #dc2626',
            borderRadius: '5px'
          }}>
            ← Back to Home
          </a>
          <a href="/firebase-test" style={{ 
            color: '#059669', 
            textDecoration: 'none',
            padding: '10px 20px',
            border: '1px solid #059669',
            borderRadius: '5px'
          }}>
            Firebase Test →
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthModePage;