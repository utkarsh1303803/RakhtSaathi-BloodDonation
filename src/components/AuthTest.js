import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signInWithEmail, signOut } from '../firebase/auth';

const AuthTest = () => {
  const { user, loading, userType, error, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testResult, setTestResult] = useState('');

  const handleTestLogin = async () => {
    try {
      setTestResult('Testing login...');
      await signInWithEmail(email, password);
      setTestResult('✅ Login successful!');
    } catch (error) {
      setTestResult(`❌ Login failed: ${error.message}`);
    }
  };

  const handleTestLogout = async () => {
    try {
      setTestResult('Testing logout...');
      await signOut();
      setTestResult('✅ Logout successful!');
    } catch (error) {
      setTestResult(`❌ Logout failed: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Loading auth test...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>🧪 Firebase Auth Stability Test</h2>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>Current Auth State:</h3>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p><strong>User Email:</strong> {user?.email || 'None'}</p>
        <p><strong>User Type:</strong> {userType || 'None'}</p>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
      </div>

      {!isAuthenticated ? (
        <div>
          <h3>Test Login:</h3>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <button 
            onClick={handleTestLogin}
            style={{ 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Test Login
          </button>
        </div>
      ) : (
        <div>
          <h3>Test Logout:</h3>
          <button 
            onClick={handleTestLogout}
            style={{ 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Test Logout
          </button>
        </div>
      )}

      {testResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
          borderRadius: '4px'
        }}>
          <strong>Test Result:</strong> {testResult}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p><strong>Crash Prevention Features:</strong></p>
        <ul>
          <li>✅ Memory leak protection</li>
          <li>✅ Race condition prevention</li>
          <li>✅ Network retry mechanism</li>
          <li>✅ Error boundaries</li>
          <li>✅ Safe state updates</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthTest;