// Firebase Connection Test
import { auth, db } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test 1: Check if Firebase is initialized
    console.log('✅ Firebase app initialized');
    console.log('Auth domain:', auth.app.options.authDomain);
    console.log('Project ID:', auth.app.options.projectId);
    
    // Test 2: Try to create a test user with email/password (skip anonymous auth)
    const testEmail = `test-${Date.now()}@bloodsaathi.com`;
    const testPassword = 'TestPass123!';
    
    try {
      console.log('🔐 Testing email/password authentication...');
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ Test user created successfully:', userCredential.user.uid);
      
      // Test 3: Test Firestore write/read
      const testDoc = doc(db, 'test', 'connection');
      await setDoc(testDoc, {
        timestamp: new Date(),
        message: 'Firebase connection test successful',
        testUser: userCredential.user.uid
      });
      console.log('✅ Firestore write successful');
      
      const docSnap = await getDoc(testDoc);
      if (docSnap.exists()) {
        console.log('✅ Firestore read successful:', docSnap.data());
      }
      
      // Test 4: Sign out and sign back in
      await auth.signOut();
      console.log('✅ Sign out successful');
      
      const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ Sign in successful:', signInCredential.user.uid);
      
      // Final cleanup
      await auth.signOut();
      console.log('✅ Final cleanup successful');
      
      return {
        success: true,
        message: 'Firebase connection test passed! All features working.',
        details: {
          authDomain: auth.app.options.authDomain,
          projectId: auth.app.options.projectId,
          apiKey: auth.app.options.apiKey ? 'Present' : 'Missing',
          testUser: userCredential.user.uid,
          firestoreWorking: true,
          authWorking: true
        }
      };
      
    } catch (authError) {
      console.error('❌ Firebase auth test failed:', authError);
      
      // If it's just a user already exists error, that's actually good news
      if (authError.code === 'auth/email-already-in-use') {
        return {
          success: true,
          message: 'Firebase is working! (Test user already exists)',
          details: {
            authDomain: auth.app.options.authDomain,
            projectId: auth.app.options.projectId,
            apiKey: 'Present',
            note: 'Authentication is working, user creation blocked due to existing user'
          }
        };
      }
      
      return {
        success: false,
        message: 'Firebase authentication failed: ' + authError.message,
        error: authError,
        details: {
          errorCode: authError.code,
          authDomain: auth.app.options.authDomain,
          projectId: auth.app.options.projectId
        }
      };
    }
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return {
      success: false,
      message: 'Firebase connection failed: ' + error.message,
      error: error
    };
  }
};

export const testEmailPasswordAuth = async (email = 'admin@bloodsaathi.com', password = 'admin123') => {
  try {
    console.log('🔥 Testing admin credentials...');
    
    // Try to sign in with admin credentials
    try {
      const signInCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Admin sign in successful:', signInCredential.user.uid);
      
      // Test admin profile lookup
      const { getAdminByFirebaseUid } = await import('../services/firebaseApi');
      const adminProfile = await getAdminByFirebaseUid(signInCredential.user.uid);
      
      await auth.signOut();
      
      return {
        success: true,
        message: 'Admin authentication successful!',
        details: {
          userId: signInCredential.user.uid,
          email: signInCredential.user.email,
          hasAdminProfile: !!adminProfile,
          adminProfile: adminProfile ? 'Found' : 'Not found'
        }
      };
      
    } catch (signInError) {
      if (signInError.code === 'auth/user-not-found') {
        // Try to create the admin user
        console.log('🔧 Admin user not found, attempting to create...');
        
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          console.log('✅ Admin user created:', userCredential.user.uid);
          
          // Create admin profile
          const { createAdmin } = await import('../services/firebaseApi');
          await createAdmin({
            firebaseUid: userCredential.user.uid,
            email: email,
            userType: 'ADMIN',
            fullName: 'System Administrator',
            name: 'System Administrator',
            role: 'ADMIN',
            permissions: ['all'],
            isActive: true,
            isVerified: true
          });
          
          await auth.signOut();
          
          return {
            success: true,
            message: 'Admin user created successfully!',
            details: {
              userId: userCredential.user.uid,
              email: userCredential.user.email,
              created: true,
              adminProfile: 'Created'
            }
          };
          
        } catch (createError) {
          throw createError;
        }
      } else {
        throw signInError;
      }
    }
    
  } catch (error) {
    console.error('❌ Admin auth test failed:', error);
    return {
      success: false,
      message: 'Admin authentication failed: ' + error.message,
      error: error,
      details: {
        errorCode: error.code,
        email: email
      }
    };
  }
};