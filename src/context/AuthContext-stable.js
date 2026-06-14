import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { getIdToken } from '../firebase/auth';
import { getDonorByFirebaseUid, getNeedyByFirebaseUid, getAdminByFirebaseUid } from '../services/firebaseApi';

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
  
  // Refs to prevent memory leaks and race conditions
  const mounted = useRef(true);
  const authUnsubscribe = useRef(null);
  const profileCheckInProgress = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
      if (authUnsubscribe.current) {
        authUnsubscribe.current();
      }
    };
  }, []);

  // Safe state updates (only if component is still mounted)
  const safeSetState = (setter, value) => {
    if (mounted.current) {
      setter(value);
    }
  };

  // Simplified profile check with error boundaries
  const checkUserProfile = async (firebaseUser) => {
    if (profileCheckInProgress.current) {
      console.log('⏳ Profile check already in progress, skipping...');
      return;
    }

    profileCheckInProgress.current = true;
    
    try {
      const uid = firebaseUser.uid;
      console.log('🔍 Checking profile for UID:', uid);

      // Check each type with individual try-catch to prevent cascade failures
      let profile = null;
      let type = 'NEW';

      // Admin check
      try {
        profile = await getAdminByFirebaseUid(uid);
        if (profile) {
          type = 'ADMIN';
          console.log('✅ Admin profile found');
        }
      } catch (adminError) {
        console.log('ℹ️ No admin profile');
      }

      // Donor check (if not admin)
      if (!profile) {
        try {
          profile = await getDonorByFirebaseUid(uid);
          if (profile) {
            type = 'DONOR';
            console.log('✅ Donor profile found');
          }
        } catch (donorError) {
          console.log('ℹ️ No donor profile');
        }
      }

      // Needy check (if not admin or donor)
      if (!profile) {
        try {
          profile = await getNeedyByFirebaseUid(uid);
          if (profile) {
            type = 'NEEDY';
            console.log('✅ Needy profile found');
          }
        } catch (needyError) {
          console.log('ℹ️ No needy profile');
        }
      }

      // Update state safely
      safeSetState(setUserType, type);
      safeSetState(setUserProfile, profile);
      
      // Cache results
      localStorage.setItem('userType', type);
      if (profile) {
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }

      console.log('✅ Profile check completed:', { type, hasProfile: !!profile });

    } catch (error) {
      console.error('❌ Profile check failed:', error);
      safeSetState(setError, 'Failed to load user profile');
      safeSetState(setUserType, 'NEW');
      safeSetState(setUserProfile, null);
    } finally {
      profileCheckInProgress.current = false;
    }
  };

  // Main auth state listener
  useEffect(() => {
    console.log('🔧 Setting up auth listener...');
    
    // Timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted.current) {
        console.log('⏰ Loading timeout - setting loading to false');
        safeSetState(setLoading, false);
      }
    }, 8000);

    // Auth state listener
    authUnsubscribe.current = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        clearTimeout(loadingTimeout);
        
        if (!mounted.current) return;

        console.log('🔥 Auth state changed:', !!firebaseUser);
        safeSetState(setError, null);

        if (firebaseUser) {
          console.log('👤 User authenticated:', firebaseUser.email);
          safeSetState(setUser, firebaseUser);
          
          // Get token safely
          try {
            const token = await getIdToken();
            localStorage.setItem('authToken', token);
          } catch (tokenError) {
            console.error('⚠️ Token error (non-critical):', tokenError);
          }

          // Check profile in background
          await checkUserProfile(firebaseUser);

        } else {
          console.log('👤 User logged out');
          safeSetState(setUser, null);
          safeSetState(setUserProfile, null);
          safeSetState(setUserType, null);
          
          // Clear cache
          localStorage.removeItem('authToken');
          localStorage.removeItem('userType');
          localStorage.removeItem('userProfile');
        }

      } catch (error) {
        console.error('❌ Auth state change error:', error);
        safeSetState(setError, 'Authentication error occurred');
      } finally {
        if (mounted.current) {
          safeSetState(setLoading, false);
        }
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      if (authUnsubscribe.current) {
        authUnsubscribe.current();
      }
    };
  }, []); // Empty dependency array to prevent re-runs

  // Refresh user profile function
  const refreshUserProfile = async () => {
    if (user && !profileCheckInProgress.current) {
      await checkUserProfile(user);
    }
  };

  // Update profile function
  const updateUserProfile = (profile, type) => {
    safeSetState(setUserProfile, profile);
    safeSetState(setUserType, type);
    localStorage.setItem('userType', type);
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  // Clear error function
  const clearError = () => safeSetState(setError, null);

  const value = {
    user,
    loading,
    userProfile,
    userType,
    error,
    refreshUserProfile,
    updateUserProfile,
    clearError,
    isAuthenticated: !!user,
    isRegistered: userType && userType !== 'NEW'
  };

  // Error boundary for auth context
  if (error && !loading) {
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
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h3>Authentication Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif'
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
          <p style={{ color: '#666', fontSize: '16px' }}>Loading Rakht Saathi...</p>
          <p style={{ color: '#999', fontSize: '12px' }}>Please wait...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};