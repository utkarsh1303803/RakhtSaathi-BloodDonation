import { createContext, useContext, useState, useEffect } from 'react';
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
  const [authError, setAuthError] = useState(null);

  // Token refresh interval
  useEffect(() => {
    let tokenRefreshInterval;
    
    if (user) {
      // Refresh token every 50 minutes (before 1-hour expiry)
      tokenRefreshInterval = setInterval(async () => {
        try {
          await getIdToken(user, true); // Force refresh
          console.log('🔄 Token refreshed automatically');
        } catch (error) {
          console.error('❌ Token refresh failed:', error);
          setAuthError('Session expired. Please login again.');
        }
      }, 50 * 60 * 1000); // 50 minutes
    }

    return () => {
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthError(null);
      
      if (firebaseUser) {
        console.log('👤 User authenticated:', firebaseUser.email);
        setUser(firebaseUser);
        
        try {
          // Get fresh token
          await getIdToken(firebaseUser, true);
          
          // Determine user type with simplified logic
          const userTypeResult = await determineUserType(firebaseUser);
          
          setUserType(userTypeResult.type);
          setUserProfile(userTypeResult.profile);
          
          // Cache user data
          localStorage.setItem('userType', userTypeResult.type);
          if (userTypeResult.profile) {
            localStorage.setItem('userProfile', JSON.stringify(userTypeResult.profile));
          }
          
        } catch (error) {
          console.error('❌ Error during auth setup:', error);
          setAuthError('Authentication error. Please try again.');
          setUserType('NEW');
          setUserProfile(null);
        }
      } else {
        console.log('👤 User logged out');
        setUser(null);
        setUserProfile(null);
        setUserType(null);
        
        // Clear cached data
        localStorage.removeItem('userType');
        localStorage.removeItem('userProfile');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Simplified user type determination
  const determineUserType = async (firebaseUser) => {
    const uid = firebaseUser.uid;
    
    try {
      // Check admin first (most restrictive)
      const adminProfile = await getAdminByFirebaseUid(uid);
      if (adminProfile) {
        return { type: 'ADMIN', profile: adminProfile };
      }
    } catch (error) {
      console.log('No admin profile found');
    }

    try {
      // Check donor
      const donorProfile = await getDonorByFirebaseUid(uid);
      if (donorProfile) {
        return { type: 'DONOR', profile: donorProfile };
      }
    } catch (error) {
      console.log('No donor profile found');
    }

    try {
      // Check needy
      const needyProfile = await getNeedyByFirebaseUid(uid);
      if (needyProfile) {
        return { type: 'NEEDY', profile: needyProfile };
      }
    } catch (error) {
      console.log('No needy profile found');
    }

    // No profile found - new user
    return { type: 'NEW', profile: null };
  };

  const refreshUserProfile = async () => {
    if (user) {
      const userTypeResult = await determineUserType(user);
      setUserType(userTypeResult.type);
      setUserProfile(userTypeResult.profile);
      
      localStorage.setItem('userType', userTypeResult.type);
      if (userTypeResult.profile) {
        localStorage.setItem('userProfile', JSON.stringify(userTypeResult.profile));
      }
    }
  };

  const updateUserProfile = (profile, type) => {
    setUserProfile(profile);
    setUserType(type);
    localStorage.setItem('userType', type);
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const clearAuthError = () => setAuthError(null);

  const value = {
    user,
    loading,
    userProfile,
    userType,
    authError,
    refreshUserProfile,
    updateUserProfile,
    clearAuthError,
    isAuthenticated: !!user,
    isRegistered: userType && userType !== 'NEW'
  };

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