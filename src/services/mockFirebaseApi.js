// Mock Firebase API for testing when Firebase is not available
// This provides the same interface as firebaseApi.js but with mock data

// Mock data storage
let mockData = {
  bloodRequests: [
    {
      id: 'mock-req-1',
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
      needyFirebaseUid: 'mock-needy-1',
      needyName: 'Priya Sharma',
      notifiedDonorsCount: 5,
      acceptedDonorsCount: 2,
      rejectedDonorsCount: 1,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)  // 1 hour ago
    },
    {
      id: 'mock-req-2',
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
      needyFirebaseUid: 'mock-needy-2',
      needyName: 'Raj Kumar',
      notifiedDonorsCount: 8,
      acceptedDonorsCount: 3,
      rejectedDonorsCount: 2,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      updatedAt: new Date(Date.now() - 30 * 60 * 1000)     // 30 minutes ago
    },
    {
      id: 'mock-req-3',
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
      needyFirebaseUid: 'mock-needy-3',
      needyName: 'Neeta Patel',
      notifiedDonorsCount: 12,
      acceptedDonorsCount: 4,
      rejectedDonorsCount: 3,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      updatedAt: new Date(Date.now() - 15 * 60 * 1000)     // 15 minutes ago
    },
    {
      id: 'mock-req-4',
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
      needyFirebaseUid: 'mock-needy-4',
      needyName: 'Vikas Gupta',
      notifiedDonorsCount: 6,
      acceptedDonorsCount: 4,
      rejectedDonorsCount: 0,
      fulfilledAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),   // 8 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)    // 2 hours ago
    },
    {
      id: 'mock-req-5',
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
      needyFirebaseUid: 'mock-needy-5',
      needyName: 'Anjali Singh',
      notifiedDonorsCount: 10,
      acceptedDonorsCount: 3,
      rejectedDonorsCount: 4,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      updatedAt: new Date(Date.now() - 5 * 60 * 1000)       // 5 minutes ago
    }
  ],
  donors: [
    {
      id: 'mock-donor-1',
      firebaseUid: 'mock-donor-uid-1',
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
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),        // 1 year ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)           // 1 week ago
    },
    {
      id: 'mock-donor-2',
      firebaseUid: 'mock-donor-uid-2',
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
      createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),       // 300 days ago
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)          // 3 days ago
    },
    {
      id: 'mock-donor-3',
      firebaseUid: 'mock-donor-uid-3',
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
      createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000),        // 500 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)           // 1 day ago
    },
    {
      id: 'mock-donor-4',
      firebaseUid: 'mock-donor-uid-4',
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
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),       // 180 days ago
      updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)         // 45 days ago
    },
    {
      id: 'mock-donor-5',
      firebaseUid: 'mock-donor-uid-5',
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
      createdAt: new Date(Date.now() - 800 * 24 * 60 * 60 * 1000),        // 800 days ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)                // 2 hours ago
    }
  ],
  users: [
    {
      id: 'mock-admin-1',
      firebaseUid: 'mock-admin-uid-1',
      email: 'admin@bloodsaathi.com',
      userType: 'ADMIN',
      fullName: 'System Administrator',
      name: 'System Administrator',
      role: 'ADMIN',
      permissions: ['all'],
      isActive: true,
      isVerified: true,
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      updatedAt: new Date()
    }
  ]
};

// Mock API functions that match the real firebaseApi.js interface
export const getAllBloodRequests = async () => {
  console.log('🔧 Mock: getAllBloodRequests called');
  return mockData.bloodRequests;
};

export const getBloodRequestsByStatus = async (status) => {
  console.log('🔧 Mock: getBloodRequestsByStatus called with status:', status);
  return mockData.bloodRequests.filter(req => req.status === status);
};

export const getAllDonors = async () => {
  console.log('🔧 Mock: getAllDonors called');
  return mockData.donors;
};

export const getAvailableDonors = async () => {
  console.log('🔧 Mock: getAvailableDonors called');
  return mockData.donors.filter(donor => donor.isAvailable);
};

export const getDonorsByBloodGroup = async (bloodGroup) => {
  console.log('🔧 Mock: getDonorsByBloodGroup called with:', bloodGroup);
  return mockData.donors.filter(donor => donor.bloodGroup === bloodGroup);
};

export const getAdminByFirebaseUid = async (firebaseUid) => {
  console.log('🔧 Mock: getAdminByFirebaseUid called with:', firebaseUid);
  return mockData.users.find(user => user.firebaseUid === firebaseUid && user.userType === 'ADMIN');
};

export const getDonorByFirebaseUid = async (firebaseUid) => {
  console.log('🔧 Mock: getDonorByFirebaseUid called with:', firebaseUid);
  return mockData.donors.find(donor => donor.firebaseUid === firebaseUid);
};

export const getNeedyByFirebaseUid = async (firebaseUid) => {
  console.log('🔧 Mock: getNeedyByFirebaseUid called with:', firebaseUid);
  // Return mock needy data if needed
  return null;
};

export const getUser = async (firebaseUid) => {
  console.log('🔧 Mock: getUser called with:', firebaseUid);
  return mockData.users.find(user => user.firebaseUid === firebaseUid);
};

export const createAdmin = async (adminData) => {
  console.log('🔧 Mock: createAdmin called with:', adminData);
  const newAdmin = {
    id: `mock-admin-${Date.now()}`,
    ...adminData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockData.users.push(newAdmin);
  return newAdmin;
};

export const createUser = async (userData) => {
  console.log('🔧 Mock: createUser called with:', userData);
  const newUser = {
    id: `mock-user-${Date.now()}`,
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockData.users.push(newUser);
  return newUser;
};

export const createBloodRequest = async (requestData) => {
  console.log('🔧 Mock: createBloodRequest called with:', requestData);
  const newRequest = {
    id: `mock-req-${Date.now()}`,
    ...requestData,
    notifiedDonorsCount: 0,
    acceptedDonorsCount: 0,
    rejectedDonorsCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockData.bloodRequests.push(newRequest);
  return newRequest;
};

export const updateBloodRequest = async (requestId, updateData) => {
  console.log('🔧 Mock: updateBloodRequest called with:', requestId, updateData);
  const requestIndex = mockData.bloodRequests.findIndex(req => req.id === requestId);
  if (requestIndex !== -1) {
    mockData.bloodRequests[requestIndex] = {
      ...mockData.bloodRequests[requestIndex],
      ...updateData,
      updatedAt: new Date()
    };
    return mockData.bloodRequests[requestIndex];
  }
  return null;
};

// Analytics functions for admin dashboard
export const getBloodRequestStats = async () => {
  console.log('🔧 Mock: getBloodRequestStats called');
  const total = mockData.bloodRequests.length;
  const active = mockData.bloodRequests.filter(req => req.status === 'ACTIVE').length;
  const fulfilled = mockData.bloodRequests.filter(req => req.status === 'FULFILLED').length;
  const urgent = mockData.bloodRequests.filter(req => req.urgency === 'IMMEDIATE' || req.urgency === 'URGENT').length;
  
  return {
    total,
    active,
    fulfilled,
    urgent,
    pending: active,
    cancelled: 0
  };
};

export const getDonorStats = async () => {
  console.log('🔧 Mock: getDonorStats called');
  const total = mockData.donors.length;
  const available = mockData.donors.filter(donor => donor.isAvailable).length;
  const totalDonations = mockData.donors.reduce((sum, donor) => sum + donor.totalDonations, 0);
  
  return {
    total,
    available,
    unavailable: total - available,
    totalDonations,
    averageRating: mockData.donors.reduce((sum, donor) => sum + donor.rating, 0) / total
  };
};

export const getRecentActivity = async () => {
  console.log('🔧 Mock: getRecentActivity called');
  return [
    {
      id: 'activity-1',
      type: 'blood_request',
      message: 'New blood request for O- in Mumbai',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      urgency: 'URGENT'
    },
    {
      id: 'activity-2',
      type: 'donor_response',
      message: 'Donor accepted request for A+ in Delhi',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      urgency: 'NORMAL'
    },
    {
      id: 'activity-3',
      type: 'request_fulfilled',
      message: 'Blood request fulfilled for AB+ in Pune',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      urgency: 'NORMAL'
    },
    {
      id: 'activity-4',
      type: 'new_donor',
      message: 'New donor registered: B+ in Bangalore',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      urgency: 'NORMAL'
    }
  ];
};

console.log('🔧 Mock Firebase API loaded with sample data');
console.log('📊 Mock data includes:', {
  bloodRequests: mockData.bloodRequests.length,
  donors: mockData.donors.length,
  users: mockData.users.length
});