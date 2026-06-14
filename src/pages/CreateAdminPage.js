import React, { useState } from 'react';
import { createTestAdmin, createAllTestAccounts } from '../utils/createAdmin';
import { createTestBloodRequests, createTestDonors, createAllTestData } from '../utils/createTestData';

const CreateAdminPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCreateAdmin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const result = await createTestAdmin();
      setResult(result);
      
      if (result.success) {
        alert('✅ Admin account created successfully!\n\nCredentials:\nEmail: admin@bloodsaathi.com\nPassword: admin123\n\nYou can now login to the admin panel!');
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAllAccounts = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const results = await createAllTestAccounts();
      setResult({
        success: true,
        message: 'Test accounts creation completed',
        details: results
      });
      
      alert('✅ All test accounts created!\n\nAdmin: admin@bloodsaathi.com / admin123\nDonor: donor@bloodsaathi.com / donor123\nNeedy: needy@bloodsaathi.com / needy123');
    } catch (error) {
      setResult({
        success: false,
        message: 'Error: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestData = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const result = await createAllTestData();
      setResult(result);
      
      if (result.success) {
        alert('✅ Test data created successfully!\n\n' +
              '• 5 Blood Requests (Active, Fulfilled, etc.)\n' +
              '• 5 Test Donors (Different blood groups)\n' +
              '• Sample data for admin dashboard\n\n' +
              'Now check the admin dashboard to see the data!');
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBloodRequests = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const result = await createTestBloodRequests();
      setResult(result);
      
      if (result.success) {
        alert('✅ Test blood requests created!\n\nCreated 5 sample blood requests with different:\n• Blood groups (A+, O-, B+, AB+, O+)\n• Cities (Delhi, Mumbai, Bangalore, Pune, Gurgaon)\n• Urgency levels (Immediate, Urgent, Normal)\n• Status (Active, Fulfilled)\n\nCheck admin dashboard to see them!');
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>🔧 BloodSaathi Setup & Test Data</h1>
        <p>Create admin accounts and populate test data for BloodSaathi platform</p>
      </div>

      {/* Admin Account Creation */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2>🔐 Create Admin Account</h2>
        <p>This will create the main admin account for the platform.</p>
        
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          <strong>Admin Credentials:</strong><br/>
          Email: admin@bloodsaathi.com<br/>
          Password: admin123
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button 
            onClick={handleCreateAdmin}
            disabled={loading}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Creating...' : '🔧 Create Admin Only'}
          </button>

          <button 
            onClick={handleCreateAllAccounts}
            disabled={loading}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Creating...' : '🎯 Create All Accounts'}
          </button>
        </div>
      </div>

      {/* Test Data Creation */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2>📊 Create Test Data</h2>
        <p>Populate the database with sample blood requests and donors for testing admin dashboard.</p>
        
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #2196f3'
        }}>
          <strong>Test Data Includes:</strong><br/>
          • 5 Blood Requests (Different urgency levels, cities, blood groups)<br/>
          • 5 Test Donors (Available/unavailable, different locations)<br/>
          • Sample data for admin analytics and monitoring
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={handleCreateBloodRequests}
            disabled={loading}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Creating...' : '🆘 Create Blood Requests'}
          </button>

          <button 
            onClick={handleCreateTestData}
            disabled={loading}
            style={{
              backgroundColor: '#7c3aed',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Creating...' : '📊 Create All Test Data'}
          </button>
        </div>
      </div>

      {result && (
        <div style={{ 
          backgroundColor: result.success ? '#d1fae5' : '#fecaca', 
          padding: '20px', 
          borderRadius: '10px',
          border: `1px solid ${result.success ? '#059669' : '#dc2626'}`,
          marginBottom: '20px'
        }}>
          <h3 style={{ color: result.success ? '#047857' : '#b91c1c', margin: '0 0 10px 0' }}>
            {result.success ? '✅ Success!' : '❌ Error'}
          </h3>
          <p style={{ margin: '0 0 10px 0' }}>{result.message}</p>
          
          {result.details && (
            <div style={{ marginTop: '15px' }}>
              <strong>Results:</strong>
              <ul style={{ marginTop: '10px' }}>
                {result.details.map((item, index) => (
                  <li key={index} style={{ 
                    color: item.success ? '#047857' : '#b91c1c',
                    marginBottom: '5px'
                  }}>
                    {item.type || item.patientName || item.fullName} 
                    {item.email && ` (${item.email})`}: 
                    {item.success ? ' ✅ Created' : ' ❌ Failed'}
                    {item.error && ` - ${item.error}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.requests && (
            <div style={{ marginTop: '15px' }}>
              <strong>Blood Requests:</strong> {result.requests.message}<br/>
              <strong>Donors:</strong> {result.donors.message}
            </div>
          )}
        </div>
      )}

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#fff3cd', 
        borderRadius: '10px',
        border: '1px solid #ffeaa7'
      }}>
        <h3 style={{ color: '#856404', margin: '0 0 15px 0' }}>📋 Complete Setup Steps</h3>
        <ol style={{ color: '#856404', paddingLeft: '20px' }}>
          <li><strong>Create Admin Account</strong> - Click "Create Admin Only" or "Create All Accounts"</li>
          <li><strong>Create Test Data</strong> - Click "Create All Test Data" to populate database</li>
          <li><strong>Login as Admin</strong> - Go to <a href="/admin/login" style={{ color: '#dc2626' }}>/admin/login</a></li>
          <li><strong>Use Credentials</strong> - admin@bloodsaathi.com / admin123</li>
          <li><strong>Check Dashboard</strong> - You should see blood requests and analytics data</li>
          <li><strong>Test Features</strong> - Try managing requests, viewing donors, etc.</li>
        </ol>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{ 
            color: '#dc2626', 
            textDecoration: 'none',
            padding: '10px 20px',
            border: '1px solid #dc2626',
            borderRadius: '5px'
          }}>
            ← Back to Home
          </a>
          <a href="/admin/login" style={{ 
            color: '#059669', 
            textDecoration: 'none',
            padding: '10px 20px',
            border: '1px solid #059669',
            borderRadius: '5px'
          }}>
            Admin Login →
          </a>
          <a href="/admin/dashboard" style={{ 
            color: '#7c3aed', 
            textDecoration: 'none',
            padding: '10px 20px',
            border: '1px solid #7c3aed',
            borderRadius: '5px'
          }}>
            Admin Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminPage;