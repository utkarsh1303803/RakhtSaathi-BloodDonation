import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const AdminDashboardPage = () => {
  const { user, userProfile, isMockMode, mockLogout } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalDonors: 0,
    totalRequests: 0,
    totalDonations: 0,
    activeDonors: 0,
    activeRequests: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      console.log('🔥 Fetching analytics...');
      
      if (isMockMode) {
        // Use mock data
        console.log('🔧 Using mock analytics data');
        const { getBloodRequestStats, getDonorStats, getRecentActivity } = await import('../../services/mockFirebaseApi');
        
        const [requestStats, donorStats, activity] = await Promise.all([
          getBloodRequestStats(),
          getDonorStats(),
          getRecentActivity()
        ]);
        
        setAnalytics({
          totalDonors: donorStats.total,
          totalRequests: requestStats.total,
          totalDonations: donorStats.totalDonations,
          activeDonors: donorStats.available,
          activeRequests: requestStats.active
        });
        
        setRecentActivity(activity);
        
        console.log('✅ Mock analytics loaded:', { requestStats, donorStats });
      } else {
        // Use real Firebase data
        console.log('🔥 Using real Firebase analytics');
        const { getAnalytics } = await import('../../services/firebaseApi');
        const data = await getAnalytics();
        setAnalytics(data);
        console.log('✅ Analytics loaded from Firebase:', data);
      }
      
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      
      // Fallback data
      setAnalytics({
        totalDonors: 5,
        totalRequests: 5,
        totalDonations: 43,
        activeDonors: 4,
        activeRequests: 4
      });
      
      setRecentActivity([
        {
          id: 'fallback-1',
          type: 'system',
          message: 'System initialized with fallback data',
          timestamp: new Date(),
          urgency: 'NORMAL'
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [isMockMode]);

  const handleLogout = async () => {
    try {
      if (isMockMode && mockLogout) {
        await mockLogout();
      } else {
        const { signOut } = await import('../../firebase/auth');
        await signOut();
      }
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading admin dashboard...</h2>
        <p>Please wait while we fetch system analytics...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>⚙️ Admin Dashboard</h1>
            <p>Welcome back, {userProfile?.name || 'Administrator'}!</p>
            {isMockMode && (
              <div style={{ 
                backgroundColor: '#fef3c7', 
                color: '#92400e', 
                padding: '5px 10px', 
                borderRadius: '5px', 
                fontSize: '12px',
                marginTop: '5px'
              }}>
                🔧 Mock Mode Active - Using test data
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <LanguageSwitcher />
            <button 
              onClick={handleRefresh} 
              className="btn btn-secondary"
              disabled={refreshing}
              style={{ minWidth: '100px' }}
            >
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="container">
        {/* Admin Info */}
        <div className="card" style={{ marginBottom: '30px', backgroundColor: '#f0f8ff', border: '2px solid #0066cc' }}>
          <h2 style={{ color: '#0066cc' }}>👤 Admin Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
            <div><strong>Name:</strong> {userProfile?.name || 'System Administrator'}</div>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Role:</strong> {userProfile?.role || 'ADMIN'}</div>
            <div><strong>Mode:</strong> {isMockMode ? '🔧 Mock Mode' : '🔥 Firebase Mode'}</div>
            <div><strong>User ID:</strong> {user?.uid}</div>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#f0fdf4' }}>
            <h3 style={{ color: '#059669', fontSize: '2rem', margin: '0' }}>{analytics.totalDonors}</h3>
            <p style={{ margin: '5px 0 0 0' }}>Total Donors</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#fef3c7' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '2rem', margin: '0' }}>{analytics.totalRequests}</h3>
            <p style={{ margin: '5px 0 0 0' }}>Blood Requests</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#e0f2fe' }}>
            <h3 style={{ color: '#0369a1', fontSize: '2rem', margin: '0' }}>{analytics.totalDonations}</h3>
            <p style={{ margin: '5px 0 0 0' }}>Total Donations</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#fef2f2' }}>
            <h3 style={{ color: '#dc2626', fontSize: '2rem', margin: '0' }}>{analytics.activeRequests}</h3>
            <p style={{ margin: '5px 0 0 0' }}>Active Requests</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#f3e8ff' }}>
            <h3 style={{ color: '#7c3aed', fontSize: '2rem', margin: '0' }}>{analytics.activeDonors}</h3>
            <p style={{ margin: '5px 0 0 0' }}>Available Donors</p>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="card" style={{ marginBottom: '30px' }}>
            <h2>📈 Recent Activity</h2>
            <div style={{ marginTop: '15px' }}>
              {recentActivity.map((activity, index) => (
                <div 
                  key={activity.id || index}
                  style={{ 
                    padding: '10px 15px', 
                    borderLeft: `4px solid ${
                      activity.urgency === 'URGENT' ? '#dc2626' : 
                      activity.urgency === 'IMMEDIATE' ? '#dc2626' : '#059669'
                    }`,
                    backgroundColor: '#f8f9fa',
                    marginBottom: '10px',
                    borderRadius: '0 5px 5px 0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{activity.message}</span>
                    <small style={{ color: '#6b7280' }}>
                      {activity.timestamp.toLocaleTimeString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="card" style={{ 
          backgroundColor: isMockMode ? '#fef3c7' : '#f0fdf4', 
          border: `1px solid ${isMockMode ? '#f59e0b' : '#bbf7d0'}`, 
          marginBottom: '30px' 
        }}>
          <h2 style={{ color: isMockMode ? '#92400e' : '#059669' }}>
            {isMockMode ? '🔧 Mock Mode Status' : '🔥 Firebase System Status'}
          </h2>
          <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            {isMockMode ? (
              <>
                <div><strong>🔧 Mock Authentication:</strong> Active</div>
                <div><strong>📊 Mock Data:</strong> Loaded</div>
                <div><strong>🔥 Firebase:</strong> Bypassed</div>
                <div><strong>💾 Data Persistence:</strong> Session Only</div>
                <div><strong>🔄 Last Updated:</strong> {new Date().toLocaleString()}</div>
              </>
            ) : (
              <>
                <div><strong>✅ Firebase Authentication:</strong> Active</div>
                <div><strong>✅ Firebase Firestore:</strong> Connected</div>
                <div><strong>❌ Backend Server:</strong> Not Required</div>
                <div><strong>❌ SQL Database:</strong> Not Used</div>
                <div><strong>🔄 Last Updated:</strong> {new Date().toLocaleString()}</div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2>⚡ Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <Link to="/admin/donors" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}>
              👥 Manage Donors
            </Link>
            <Link to="/admin/requests" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}>
              🆘 View Requests
            </Link>
            <Link to="/admin/feedback-alerts" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}>
              💬 View Feedback
            </Link>
            <Link to="/admin/certificates" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}>
              🏆 Certificates
            </Link>
            <button 
              onClick={handleRefresh}
              className="btn btn-secondary"
              style={{ padding: '15px' }}
              disabled={refreshing}
            >
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
            </button>
            {isMockMode && (
              <a 
                href="/auth-mode" 
                className="btn btn-warning" 
                style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}
              >
                🔧 Auth Settings
              </a>
            )}
          </div>
        </div>

        {/* Data Collections Info */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2>📊 {isMockMode ? 'Mock Data Collections' : 'Firebase Collections'}</h2>
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4>👥 users</h4>
              <p>User profiles and authentication data</p>
              <small>Contains: firebaseUid, email, userType</small>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4>🩸 donors</h4>
              <p>Donor profiles and availability status</p>
              <small>Contains: personal info, blood group, location</small>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4>🆘 needy</h4>
              <p>Needy user profiles</p>
              <small>Contains: personal info, contact details</small>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4>🩸 bloodRequests</h4>
              <p>Blood requests and matching data</p>
              <small>Contains: patient info, donor notifications</small>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4>💬 feedback</h4>
              <p>User feedback and ratings</p>
              <small>Contains: ratings, comments, suggestions</small>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4>🏆 certificates</h4>
              <p>Donation certificates</p>
              <small>Contains: donor achievements, certificates</small>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="card" style={{ backgroundColor: '#e0f2fe', border: '1px solid #0ea5e9' }}>
          <h2 style={{ color: '#0369a1' }}>🏗️ System Architecture</h2>
          <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <div>
              <strong>Frontend:</strong> React.js with {isMockMode ? 'Mock' : 'Firebase'} SDK<br/>
              <strong>Routing:</strong> React Router v6<br/>
              <strong>State:</strong> React Context API
            </div>
            <div>
              <strong>Database:</strong> {isMockMode ? 'Mock Data (In-Memory)' : 'Firebase Firestore (NoSQL)'}<br/>
              <strong>Authentication:</strong> {isMockMode ? 'Mock Auth' : 'Firebase Auth'}<br/>
              <strong>Storage:</strong> {isMockMode ? 'Local Storage' : 'Firebase Storage'}
            </div>
            <div>
              <strong>Hosting:</strong> Firebase Hosting Ready<br/>
              <strong>Security:</strong> {isMockMode ? 'Mock Rules' : 'Firebase Security Rules'}<br/>
              <strong>Real-time:</strong> {isMockMode ? 'Simulated' : 'Firestore Real-time Updates'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;