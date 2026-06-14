import { createContext, useContext, useState, useEffect } from 'react';

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
  const [userProfile, setUserProfile] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock authentication for testing when Firebase is not working
  const mockLogin = (email, password, type = 'ADMIN') => {
    console.log('🔧 Mock login activated:', { email, type });
    
    const mockUser = {
      uid: `mock-${type.toLowerCase()}-${Date.now()}`,
      email: email,
      emailVerified: true
    };
    
    const mockProfile = {
      firebaseUid: mockUser.uid,
      email: email,
      userType: type,
      fullName: type === 'ADMIN' ? 'Mock Administrator' : `Mock ${type}`,
      name: type === 'ADMIN' ? 'Mock Administrator' : `Mock ${type}`,
      role: type,
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setUser(mockUser);
    setUserProfile(mockProfile);
    setUserType(type);
    setIsAuthenticated(true);
    
    // Store in localStorage for persistence
    localStorage.setItem('mockAuth', JSON.stringify({
      user: mockUser,
      profile: mockProfile,
      type: type
    }));
    
    return Promise.resolve({ user: mockUser, profile: mockProfile });
  };

  const mockLogout = () => {
    console.log('🔧 Mock logout');
    setUser(null);
    setUserProfile(null);
    setUserType(null);
    setIsAuthenticated(false);
    localStorage.removeItem('mockAuth');
    return Promise.resolve();
  };

  // Check for existing mock session on load
  useEffect(() => {
    const mockAuth = localStorage.getItem('mockAuth');
    if (mockAuth) {
      try {
        const { user, profile, type } = JSON.parse(mockAuth);
        console.log('🔧 Restoring mock session:', type);
        setUser(user);
        setUserProfile(profile);
        setUserType(type);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error restoring mock session:', error);
        localStorage.removeItem('mockAuth');
      }
    }
    setLoading(false);
  }, []);

  const updateUserProfile = async (profile, type) => {
    console.log('🔧 Mock updateUserProfile:', { profile, type });
    setUserType(type);
    setUserProfile(profile);
    
    // Update localStorage
    const mockAuth = localStorage.getItem('mockAuth');
    if (mockAuth) {
      const auth = JSON.parse(mockAuth);
      auth.profile = profile;
      auth.type = type;
      localStorage.setItem('mockAuth', JSON.stringify(auth));
    }
  };

  const refreshUserProfile = async () => {
    console.log('🔧 Mock refreshUserProfile - no action needed');
    return Promise.resolve();
  };

  const value = {
    user,
    userProfile,
    userType,
    loading,
    isAuthenticated,
    updateUserProfile,
    refreshUserProfile,
    // Mock-specific methods
    mockLogin,
    mockLogout,
    isMockMode: true
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};