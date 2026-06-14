// Improved Firebase Auth Helper Functions
import { 
  signOut as firebaseSignOut, 
  getIdToken as firebaseGetIdToken,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from './firebaseConfig';

// Sign out user
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    // Clear any cached tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userProfile');
    console.log('✅ User signed out successfully');
  } catch (error) {
    console.error('❌ Sign out error:', error);
    throw error;
  }
};

// Get ID token with automatic refresh
export const getIdToken = async (user = null, forceRefresh = false) => {
  try {
    const currentUser = user || auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    const token = await firebaseGetIdToken(currentUser, forceRefresh);
    
    // Cache token for API calls
    localStorage.setItem('authToken', token);
    
    return token;
  } catch (error) {
    console.error('❌ Get token error:', error);
    // Clear invalid token
    localStorage.removeItem('authToken');
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ User signed in:', userCredential.user.email);
    return userCredential;
  } catch (error) {
    console.error('❌ Sign in error:', error);
    throw error;
  }
};

// Create account with email and password
export const createAccountWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Account created:', userCredential.user.email);
    return userCredential;
  } catch (error) {
    console.error('❌ Account creation error:', error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent to:', email);
  } catch (error) {
    console.error('❌ Password reset error:', error);
    throw error;
  }
};

// Update user password (requires recent authentication)
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Re-authenticate user before password change
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
    console.log('✅ Password updated successfully');
  } catch (error) {
    console.error('❌ Password change error:', error);
    throw error;
  }
};

// Get cached token (for API calls)
export const getCachedToken = () => {
  return localStorage.getItem('authToken');
};

// Check if token is likely expired (basic check)
export const isTokenLikelyExpired = () => {
  const token = getCachedToken();
  if (!token) return true;
  
  try {
    // Basic JWT expiry check (Firebase tokens are JWTs)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    return payload.exp < now;
  } catch (error) {
    return true; // Assume expired if we can't parse
  }
};

// Refresh token if needed
export const ensureFreshToken = async () => {
  if (isTokenLikelyExpired()) {
    return await getIdToken(null, true);
  }
  return getCachedToken();
};