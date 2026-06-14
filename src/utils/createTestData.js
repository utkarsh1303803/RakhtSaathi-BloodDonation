// Test Data Creator for BloodSaathi
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const createTestBloodRequests = async () => {
  try {
    console.log('🔧 Creating test blood requests...');
    
    const testRequests = [
      {
        patientName: 'राहुल शर्मा (Rahul Sharma)',
        bloodGroup: 'A_POSITIVE',
        unitsNeeded: 2,
        urgency: 'IMMEDIATE',
        hospital: 'AIIMS Delhi',
        city: 'Delhi',
        attendantName: 'प्रिया शर्मा (Priya Sharma)',
        attendantPhone: '+919876543210',
        additionalNotes: 'Emergency surgery required. Patient is critical.',
        status: 'ACTIVE',
        needyFirebaseUid: 'test-needy-1',
        needyName: 'Priya Sharma',
        notifiedDonorsCount: 0,
        acceptedDonorsCount: 0,
        rejectedDonorsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        patientName: 'सुनीता देवी (Sunita Devi)',
        bloodGroup: 'O_NEGATIVE',
        unitsNeeded: 1,
        urgency: 'URGENT',
        hospital: 'Fortis Hospital',
        city: 'Mumbai',
        attendantName: 'राज कुमार (Raj Kumar)',
        attendantPhone: '+919876543211',
        additionalNotes: 'Blood needed for delivery complications.',
        status: 'ACTIVE',
        needyFirebaseUid: 'test-needy-2',
        needyName: 'Raj Kumar',
        notifiedDonorsCount: 3,
        acceptedDonorsCount: 1,
        rejectedDonorsCount: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        patientName: 'अमित पटेल (Amit Patel)',
        bloodGroup: 'B_POSITIVE',
        unitsNeeded: 3,
        urgency: 'NORMAL',
        hospital: 'Apollo Hospital',
        city: 'Bangalore',
        attendantName: 'नीता पटेल (Neeta Patel)',
        attendantPhone: '+919876543212',
        additionalNotes: 'Scheduled surgery next week.',
        status: 'ACTIVE',
        needyFirebaseUid: 'test-needy-3',
        needyName: 'Neeta Patel',
        notifiedDonorsCount: 5,
        acceptedDonorsCount: 2,
        rejectedDonorsCount: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        patientName: 'मीरा गुप्ता (Meera Gupta)',
        bloodGroup: 'AB_POSITIVE',
        unitsNeeded: 1,
        urgency: 'IMMEDIATE',
        hospital: 'Max Hospital',
        city: 'Pune',
        attendantName: 'विकास गुप्ता (Vikas Gupta)',
        attendantPhone: '+919876543213',
        additionalNotes: 'Accident case, immediate blood required.',
        status: 'FULFILLED',
        needyFirebaseUid: 'test-needy-4',
        needyName: 'Vikas Gupta',
        notifiedDonorsCount: 4,
        acceptedDonorsCount: 3,
        rejectedDonorsCount: 0,
        fulfilledAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        patientName: 'रोहित सिंह (Rohit Singh)',
        bloodGroup: 'O_POSITIVE',
        unitsNeeded: 2,
        urgency: 'URGENT',
        hospital: 'Medanta Hospital',
        city: 'Gurgaon',
        attendantName: 'अंजली सिंह (Anjali Singh)',
        attendantPhone: '+919876543214',
        additionalNotes: 'Cancer treatment, regular blood transfusion needed.',
        status: 'ACTIVE',
        needyFirebaseUid: 'test-needy-5',
        needyName: 'Anjali Singh',
        notifiedDonorsCount: 6,
        acceptedDonorsCount: 2,
        rejectedDonorsCount: 2,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];
    
    const results = [];
    
    for (const request of testRequests) {
      try {
        const docRef = await addDoc(collection(db, 'bloodRequests'), request);
        results.push({
          id: docRef.id,
          patientName: request.patientName,
          bloodGroup: request.bloodGroup,
          city: request.city,
          status: request.status,
          success: true
        });
        console.log(`✅ Created blood request for ${request.patientName}`);
      } catch (error) {
        console.error(`❌ Failed to create request for ${request.patientName}:`, error);
        results.push({
          patientName: request.patientName,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      message: `Created ${results.filter(r => r.success).length} test blood requests`,
      results: results
    };
    
  } catch (error) {
    console.error('❌ Error creating test blood requests:', error);
    return {
      success: false,
      message: 'Failed to create test data: ' + error.message,
      error: error
    };
  }
};

export const createTestDonors = async () => {
  try {
    console.log('🔧 Creating test donors...');
    
    const testDonors = [
      {
        firebaseUid: 'test-donor-1',
        fullName: 'अरुण कुमार (Arun Kumar)',
        email: 'arun.kumar@example.com',
        bloodGroup: 'A_POSITIVE',
        city: 'Delhi',
        phone: '+919876543301',
        age: 28,
        weight: 65,
        isAvailable: true,
        totalDonations: 5,
        rating: 4.8,
        lastDonationDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        firebaseUid: 'test-donor-2',
        fullName: 'प्रिया शर्मा (Priya Sharma)',
        email: 'priya.sharma@example.com',
        bloodGroup: 'O_NEGATIVE',
        city: 'Mumbai',
        phone: '+919876543302',
        age: 25,
        weight: 55,
        isAvailable: true,
        totalDonations: 8,
        rating: 4.9,
        lastDonationDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // 95 days ago
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        firebaseUid: 'test-donor-3',
        fullName: 'राज पटेल (Raj Patel)',
        email: 'raj.patel@example.com',
        bloodGroup: 'B_POSITIVE',
        city: 'Bangalore',
        phone: '+919876543303',
        age: 32,
        weight: 70,
        isAvailable: true,
        totalDonations: 12,
        rating: 4.7,
        lastDonationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        firebaseUid: 'test-donor-4',
        fullName: 'सुमित्रा देवी (Sumitra Devi)',
        email: 'sumitra.devi@example.com',
        bloodGroup: 'AB_POSITIVE',
        city: 'Pune',
        phone: '+919876543304',
        age: 29,
        weight: 58,
        isAvailable: false, // Currently not available
        totalDonations: 3,
        rating: 4.5,
        lastDonationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago (too recent)
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        firebaseUid: 'test-donor-5',
        fullName: 'विकास गुप्ता (Vikas Gupta)',
        email: 'vikas.gupta@example.com',
        bloodGroup: 'O_POSITIVE',
        city: 'Gurgaon',
        phone: '+919876543305',
        age: 35,
        weight: 75,
        isAvailable: true,
        totalDonations: 15,
        rating: 5.0,
        lastDonationDate: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000), // 110 days ago
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];
    
    const results = [];
    
    for (const donor of testDonors) {
      try {
        const docRef = await addDoc(collection(db, 'donors'), donor);
        results.push({
          id: docRef.id,
          fullName: donor.fullName,
          bloodGroup: donor.bloodGroup,
          city: donor.city,
          success: true
        });
        console.log(`✅ Created donor: ${donor.fullName}`);
      } catch (error) {
        console.error(`❌ Failed to create donor ${donor.fullName}:`, error);
        results.push({
          fullName: donor.fullName,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      message: `Created ${results.filter(r => r.success).length} test donors`,
      results: results
    };
    
  } catch (error) {
    console.error('❌ Error creating test donors:', error);
    return {
      success: false,
      message: 'Failed to create test donors: ' + error.message,
      error: error
    };
  }
};

export const createAllTestData = async () => {
  try {
    console.log('🔧 Creating all test data...');
    
    const requestsResult = await createTestBloodRequests();
    const donorsResult = await createTestDonors();
    
    return {
      success: true,
      message: 'All test data created successfully!',
      requests: requestsResult,
      donors: donorsResult
    };
    
  } catch (error) {
    console.error('❌ Error creating all test data:', error);
    return {
      success: false,
      message: 'Failed to create test data: ' + error.message,
      error: error
    };
  }
};