import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, needyApi, donorApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On app load - restore session from localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('jwt_token');
      const savedUserType = localStorage.getItem('userType');
      const savedEmail = localStorage.getItem('userEmail');
      const savedFullName = localStorage.getItem('userFullName');
      const savedUserId = localStorage.getItem('userId');

      if (token && savedUserType && savedEmail) {
        // Restore basic user info
        const restoredUser = {
          uid: savedUserId,
          id: savedUserId,
          email: savedEmail,
          fullName: savedFullName,
          name: savedFullName,
        };

        setUser(restoredUser);
        setUserType(savedUserType);
        setIsAuthenticated(true);

        // Fetch full profile based on user type
        try {
          if (savedUserType === 'NEEDY') {
            const profile = await needyApi.getProfile();
            setUserProfile({ ...profile, userType: 'NEEDY' });
          } else if (savedUserType === 'DONOR') {
            const profile = await donorApi.getMe();
            setUserProfile({ ...profile, userType: 'DONOR' });
          } else if (savedUserType === 'ADMIN') {
            setUserProfile({
              id: savedUserId,
              email: savedEmail,
              fullName: savedFullName,
              name: savedFullName,
              role: 'ADMIN',
              userType: 'ADMIN'
            });
          }
        } catch (error) {
          console.error('Error restoring profile:', error);
          // If profile fetch fails (token expired), clear session
          if (error.response?.status === 401 || error.response?.status === 403) {
            authApi.logout();
            setUser(null);
            setUserProfile(null);
            setUserType(null);
            setIsAuthenticated(false);
          }
          // 404 = profile not created yet (new user) - that's OK, keep session
        }
      }

      setLoading(false);
    };

    restoreSession();
  }, []);

  // Login function - replaces Firebase signInWithEmailAndPassword
  const login = async (email, password) => {
    const data = await authApi.login(email, password);

    const userObj = {
      uid: String(data.userId),
      id: String(data.userId),
      email: data.email,
      fullName: data.fullName,
      name: data.fullName,
    };

    setUser(userObj);
    setUserType(data.userType);
    setIsAuthenticated(true);

    // Fetch full profile in background - don't block login
    if (data.userType === 'NEEDY') {
      needyApi.getProfile()
        .then(profile => setUserProfile({ ...profile, userType: 'NEEDY' }))
        .catch(() => {});
    } else if (data.userType === 'DONOR') {
      donorApi.getMe()
        .then(profile => setUserProfile({ ...profile, userType: 'DONOR' }))
        .catch(() => {});
    } else if (data.userType === 'ADMIN') {
      setUserProfile({
        id: String(data.userId),
        email: data.email,
        fullName: data.fullName,
        name: data.fullName,
        role: 'ADMIN',
        userType: 'ADMIN'
      });
    }

    return data;
  };

  // Register function - replaces Firebase createUserWithEmailAndPassword
  const register = async (email, password, fullName, userType) => {
    const userId = await authApi.register(email, password, fullName, userType);
    return userId;
  };

  // Logout function - replaces Firebase signOut
  const logout = () => {
    authApi.logout();
    setUser(null);
    setUserProfile(null);
    setUserType(null);
    setIsAuthenticated(false);
  };

  // Update profile in context (called after profile creation/update)
  const updateUserProfile = (profile, type) => {
    setUserProfile({ ...profile, userType: type });
    setUserType(type);
    if (type) localStorage.setItem('userType', type);
  };

  // Refresh profile from backend
  const refreshUserProfile = async () => {
    if (!userType) return;
    try {
      if (userType === 'NEEDY') {
        const profile = await needyApi.getProfile();
        setUserProfile({ ...profile, userType: 'NEEDY' });
      } else if (userType === 'DONOR') {
        const profile = await donorApi.getMe();
        setUserProfile({ ...profile, userType: 'DONOR' });
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const value = {
    user,
    userProfile,
    userType,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUserProfile,
    refreshUserProfile,
    // Keep isMockMode as false (no more mock mode)
    isMockMode: false,
    mockLogin: null,
    mockLogout: null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
