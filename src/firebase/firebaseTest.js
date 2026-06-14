// Firebase Connection Test
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export const testFirebaseConnection = () => {
  console.log('🧪 Testing Firebase connection...');
  
  try {
    // Test auth object
    console.log('🔥 Auth object:', !!auth);
    console.log('🔥 Auth app:', !!auth.app);
    console.log('🔥 Auth config:', auth.config);
    
    // Test database object
    console.log('📊 Database object:', !!db);
    console.log('📊 Database app:', !!db.app);
    
    // Test auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔥 Auth state listener working:', !!user);
      if (user) {
        console.log('👤 User found:', user.email);
      } else {
        console.log('👤 No user found');
      }
      unsubscribe(); // Clean up test listener
    });
    
    console.log('✅ Firebase connection test completed');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

// Auto-run test
testFirebaseConnection();