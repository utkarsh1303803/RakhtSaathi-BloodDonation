// Quick Admin Account Creator for BloodSaathi
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { createAdmin } from '../services/firebaseApi';

export const createTestAdmin = async () => {
  try {
    console.log('🔧 Creating test admin account...');
    
    const adminEmail = 'admin@bloodsaathi.com';
    const adminPassword = 'admin123';
    
    // Step 1: Create Firebase Auth user
    let user;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      user = userCredential.user;
      console.log('✅ New admin Firebase Auth user created:', user.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('🔄 Admin user already exists, signing in...');
        const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        user = userCredential.user;
        console.log('✅ Signed in to existing admin user:', user.uid);
      } else {
        throw error;
      }
    }
    
    // Step 2: Create admin profile in Firestore
    await createAdmin({
      firebaseUid: user.uid,
      email: adminEmail,
      userType: 'ADMIN',
      fullName: 'System Administrator',
      name: 'System Administrator',
      role: 'ADMIN',
      permissions: ['all'],
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Admin profile created in Firestore');
    
    return {
      success: true,
      message: 'Admin account created successfully!',
      credentials: {
        email: adminEmail,
        password: adminPassword
      }
    };
    
  } catch (error) {
    console.error('❌ Error creating test admin:', error);
    return {
      success: false,
      message: 'Failed to create admin account: ' + error.message,
      error: error
    };
  }
};

// Alternative method: Create multiple test accounts
export const createAllTestAccounts = async () => {
  try {
    console.log('🔧 Creating all test accounts...');
    
    const accounts = [
      {
        email: 'admin@bloodsaathi.com',
        password: 'admin123',
        type: 'ADMIN',
        name: 'System Administrator'
      },
      {
        email: 'donor@bloodsaathi.com', 
        password: 'donor123',
        type: 'DONOR',
        name: 'Test Donor'
      },
      {
        email: 'needy@bloodsaathi.com',
        password: 'needy123', 
        type: 'NEEDY',
        name: 'Test Needy User'
      }
    ];
    
    const results = [];
    
    for (const account of accounts) {
      try {
        // Create Firebase Auth user
        let user;
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, account.email, account.password);
          user = userCredential.user;
          console.log(`✅ Created ${account.type} user:`, user.uid);
        } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
            const userCredential = await signInWithEmailAndPassword(auth, account.email, account.password);
            user = userCredential.user;
            console.log(`🔄 ${account.type} user already exists:`, user.uid);
          } else {
            throw error;
          }
        }
        
        // Create profile based on type
        if (account.type === 'ADMIN') {
          await createAdmin({
            firebaseUid: user.uid,
            email: account.email,
            userType: account.type,
            fullName: account.name,
            name: account.name,
            role: 'ADMIN',
            permissions: ['all'],
            isActive: true,
            isVerified: true
          });
        }
        // Add donor and needy creation logic here if needed
        
        results.push({
          type: account.type,
          email: account.email,
          success: true
        });
        
      } catch (error) {
        console.error(`❌ Error creating ${account.type} account:`, error);
        results.push({
          type: account.type,
          email: account.email,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
    throw error;
  }
};