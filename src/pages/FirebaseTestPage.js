import React, { useState } from 'react';
import { testFirebaseConnection, testEmailPasswordAuth } from '../utils/firebaseTest';

const FirebaseTestPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (result) => {
    setResults(prev => [...prev, { ...result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runConnectionTest = async () => {
    setLoading(true);
    try {
      const result = await testFirebaseConnection();
      addResult({
        test: 'Firebase Connection Test',
        ...result
      });
    } catch (error) {
      addResult({
        test: 'Firebase Connection Test',
        success: false,
        message: 'Test failed: ' + error.message,
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  const runAuthTest = async () => {
    setLoading(true);
    try {
      const result = await testEmailPasswordAuth();
      addResult({
        test: 'Admin Authentication Test',
        ...result
      });
    } catch (error) {
      addResult({
        test: 'Admin Authentication Test',
        success: false,
        message: 'Test failed: ' + error.message,
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>🔥 Firebase Connection Test</h1>
        <p>Test Firebase configuration and connectivity</p>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2>🧪 Run Tests</h2>
        <p>Click the buttons below to test different Firebase features:</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={runConnectionTest}
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
            {loading ? 'Testing...' : '🔗 Connection Test'}
          </button>

          <button 
            onClick={runAuthTest}
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
            {loading ? 'Testing...' : '🔐 Admin Test'}
          </button>

          <button 
            onClick={clearResults}
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
            🗑️ Clear Results
          </button>
        </div>

        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          <strong>Current Firebase Config:</strong><br/>
          Project ID: bloodsaathi-69e5d<br/>
          Auth Domain: bloodsaathi-69e5d.firebaseapp.com<br/>
          API Key: {process.env.REACT_APP_FIREBASE_API_KEY ? 'Configured' : 'Missing'}
        </div>
      </div>

      {results.length > 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2>📊 Test Results</h2>
          
          {results.map((result, index) => (
            <div 
              key={index}
              style={{ 
                backgroundColor: result.success ? '#d1fae5' : '#fecaca', 
                padding: '15px', 
                borderRadius: '8px',
                border: `1px solid ${result.success ? '#059669' : '#dc2626'}`,
                marginBottom: '15px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ color: result.success ? '#047857' : '#b91c1c', margin: 0 }}>
                  {result.success ? '✅' : '❌'} {result.test}
                </h3>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {result.timestamp}
                </span>
              </div>
              
              <p style={{ margin: '0 0 10px 0', color: result.success ? '#047857' : '#b91c1c' }}>
                {result.message}
              </p>
              
              {result.details && (
                <div style={{ marginTop: '10px', fontSize: '14px' }}>
                  <strong>Details:</strong>
                  <pre style={{ 
                    backgroundColor: 'rgba(0,0,0,0.1)', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    marginTop: '5px',
                    fontSize: '12px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
              
              {result.error && (
                <div style={{ marginTop: '10px', fontSize: '14px' }}>
                  <strong>Error Details:</strong>
                  <pre style={{ 
                    backgroundColor: 'rgba(220, 38, 38, 0.1)', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    marginTop: '5px',
                    fontSize: '12px',
                    overflow: 'auto',
                    color: '#b91c1c'
                  }}>
                    {result.error.code}: {result.error.message}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#fff3cd', 
        borderRadius: '10px',
        border: '1px solid #ffeaa7'
      }}>
        <h3 style={{ color: '#856404', margin: '0 0 15px 0' }}>🔧 Troubleshooting</h3>
        <div style={{ color: '#856404' }}>
          <p><strong>If tests fail:</strong></p>
          <ol style={{ paddingLeft: '20px' }}>
            <li>Check if Firebase project exists and is active</li>
            <li>Verify API key is correct in .env file</li>
            <li>Ensure Authentication is enabled in Firebase Console</li>
            <li>Check Firestore database is created</li>
            <li>Verify domain is authorized in Firebase Console</li>
          </ol>
          
          <p style={{ marginTop: '15px' }}><strong>Common Solutions:</strong></p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Restart development server after changing .env</li>
            <li>Clear browser cache and cookies</li>
            <li>Check browser console for additional errors</li>
            <li>Verify Firebase project billing status</li>
          </ul>
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
          <a href="/create-admin" style={{ 
            color: '#059669', 
            textDecoration: 'none',
            padding: '10px 20px',
            border: '1px solid #059669',
            borderRadius: '5px'
          }}>
            Admin Setup →
          </a>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTestPage;