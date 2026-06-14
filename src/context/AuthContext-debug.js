import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import '../firebase/firebaseTest'; // Auto-run Firebase test

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userType, setUserType] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);
  
  const mounted = useRef(true);
  const authUnsubscribe = useRef(null);

  // Debug logger
  const addDebugInfo = (message) => {
    console.log('🔧 DEBUG:', message);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    return () => {
      mounted.current = false;
      if (authUnsubscribe.current) {
        authUnsubscribe.current();
      }
    };
  }, []);

  useEffect(() => {
    addDebugInfo('Starting auth initialization...');
    
    // Force loading to false after 5 seconds for debugging
    const forceLoadingTimeout = setTimeout(() => {
      if (mounted.current && loading) {
        addDebugInfo('FORCE: Setting loading to false after 5 seconds');
        setLoading(false);
        setError('Auth initialization timeout - check Firebase config');
      }
    }, 5000);

    try {
      addDebugInfo('Setting up Firebase auth listener...');
      
      authUnsubscribe.current = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          clearTimeout(forceLoadingTimeout);
          addDebugInfo(`Auth state changed: ${firebaseUser ? 'User found' : 'No user'}`);
          
          if (!mounted.current) {
            addDebugInfo('Component unmounted, skipping state update');
            return;
          }

          if (firebaseUser) {
            addDebugInfo(`User authenticated: ${firebaseUser.email}`);
            setUser(firebaseUser);
            setUserType('NEW'); // Simplified for debugging
            setUserProfile(null);
          } else {
            addDebugInfo('User logged out');
            setUser(null);
            setUserProfile(null);
            setUserType(null);
          }

          addDebugInfo('Setting loading to false');
          setLoading(false);

        } catch (error) {
          addDebugInfo(`Auth state change error: ${error.message}`);
          setError(`Auth error: ${error.message}`);
          setLoading(false);
        }
      });

      addDebugInfo('Auth listener set up successfully');

    } catch (error) {
      addDebugInfo(`Failed to set up auth listener: ${error.message}`);
      setError(`Setup error: ${error.message}`);
      setLoading(false);
      clearTimeout(forceLoadingTimeout);
    }

    return () => {
      clearTimeout(forceLoadingTimeout);
      if (authUnsubscribe.current) {
        authUnsubscribe.current();
      }
    };
  }, []);

  const value = {
    user,
    loading,
    userProfile,
    userType,
    error,
    debugInfo,
    isAuthenticated: !!user,
    isRegistered: userType && userType !== 'NEW'
  };

  // Show debug info while loading
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        padding: '20px'
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #dc3545',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>Loading Rakht Saathi...</p>
        
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px', 
          maxWidth: '500px',
          textAlign: 'left'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🔧 Debug Info:</h4>
          {debugInfo.length === 0 ? (
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Initializing...</p>
          ) : (
            debugInfo.map((info, index) => (
              <p key={index} style={{ 
                margin: '5px 0', 
                color: '#666', 
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>
                {info}
              </p>
            ))
          )}
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '15px',
            maxWidth: '500px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};