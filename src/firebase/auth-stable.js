// Crash-Proof Firebase Auth Helper Functions
import { 
  signOut as firebaseSignOut, 
  getIdToken as firebaseGetIdToken,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './firebaseConfig';

// Maximum retry attempts for operations
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function for retrying operations
const retryOperation = async (operation, maxRetries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }
};

// Safe sign out with cleanup
export const signOut = async () => {
  try {
    await retryOperation(async () => {
      await firebaseSignOut(auth);
    });
    
    // Clear all cached data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userProfile');
    
    console.log('✅ User signed out successfully');
    return true;
  } catch (error) {
    console.error('❌ Sign out error:', error);
    
    // Force clear cache even if signOut fails
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userProfile');
    
    throw new Error('Sign out failed. Please refresh the page.');
  }
};

// Safe token retrieval with fallback
export const getIdToken = async (user = null, forceRefresh = false) => {
  try {
    const currentUser = user || auth.currentUser;
    
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const token = await retryOperation(async () => {
      return await firebaseGetIdToken(currentUser, forceRefresh);
    });

    // Cache token
    localStorage.setItem('authToken', token);
    return token;
    
  } catch (error) {
    console.error('❌ Token retrieval error:', error);
    
    // Clear invalid token
    localStorage.removeItem('authToken');
    
    // Return cached token as fallback (if not forcing refresh)
    if (!forceRefresh) {
      const cachedToken = localStorage.getItem('authToken');
      if (cachedToken) {
        console.log('⚠️ Using cached token as fallback');
        return cachedToken;
      }
    }
    
    throw new Error('Unable to get authentication token');
  }
};

// Safe sign in with better error handling
export const signInWithEmail = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const userCredential = await retryOperation(async () => {
      return await signInWithEmailAndPassword(auth, email, password);
    });

    console.log('✅ User signed in:', userCredential.user.email);
    return userCredential;
    
  } catch (error) {
    console.error('❌ Sign in error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'Sign in failed';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection';
        break;
      default:
        errorMessage = error.message || 'Sign in failed';
    }
    
    throw new Error(errorMessage);
  }
};

// Safe account creation
export const createAccountWithEmail = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const userCredential = await retryOperation(async () => {
      return await createUserWithEmailAndPassword(auth, email, password);
    });

    console.log('✅ Account created:', userCredential.user.email);
    return userCredential;
    
  } catch (error) {
    console.error('❌ Account creation error:', error);
    
    let errorMessage = 'Account creation failed';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection';
        break;
      default:
        errorMessage = error.message || 'Account creation failed';
    }
    
    throw new Error(errorMessage);
  }
};

// Safe password reset
export const resetPassword = async (email) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    await retryOperation(async () => {
      await sendPasswordResetEmail(auth, email);
    });

    console.log('✅ Password reset email sent to:', email);
    return true;
    
  } catch (error) {
    console.error('❌ Password reset error:', error);
    
    let errorMessage = 'Password reset failed';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection';
        break;
      default:
        errorMessage = error.message || 'Password reset failed';
    }
    
    throw new Error(errorMessage);
  }
};

// Get cached token (for API calls)
export const getCachedToken = () => {
  return localStorage.getItem('authToken');
};

// Check current auth state safely
export const getCurrentUser = () => {
  try {
    return auth.currentUser;
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

// Safe auth state check
export const isUserAuthenticated = () => {
  try {
    const user = getCurrentUser();
    const cachedToken = getCachedToken();
    return !!(user && cachedToken);
  } catch (error) {
    console.error('❌ Error checking auth state:', error);
    return false;
  }
};