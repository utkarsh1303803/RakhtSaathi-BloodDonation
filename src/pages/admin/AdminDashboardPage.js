import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const AdminDashboardPage = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({ totalDonors: 0, totalRequests: 0, totalDonations: 0, activeDonors: 0, activeRequests: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.getDashboard();
      setAnalytics({
        totalDonors: data.totalDonors || 0,
        totalRequests: data.totalRequests || 0,
        totalDonations: data.totalDonations || 0,
        activeDonors: data.activeDonors || 0,
        activeRequests: data.activeRequests || 0,
        fulfilledRequests: data.fulfilledRequests || 0,
        totalFeedback: data.totalFeedback || 0,
        totalUsers: data.totalUsers || 0
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '50px' }}><h2>Loading admin dashboard...</h2></div>;

  return (
    <div className="admin-dashboard">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>⚙️ Admin Dashboard</h1>
            <p>Welcome back, {userProfile?.name || userProfile?.fullName || 'Administrator'}!</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <LanguageSwitcher />
            <button onClick={fetchAnalytics} className="btn btn-secondary" disabled={refreshing} style={{ minWidth: '100px' }}>
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ marginBottom: '30px', backgroundColor: '#f0f8ff', border: '2px solid #0066cc' }}>
          <h2 style={{ color: '#0066cc' }}>👤 Admin Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
            <div><strong>Name:</strong> {userProfile?.name || userProfile?.fullName || 'System Administrator'}</div>
            <div><strong>Email:</strong> {userProfile?.email || user?.email}</div>
            <div><strong>Role:</strong> {userProfile?.role || 'ADMIN'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {[
            { label: 'Total Donors', value: analytics.totalDonors, color: '#059669', bg: '#f0fdf4' },
            { label: 'Blood Requests', value: analytics.totalRequests, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Total Donations', value: analytics.totalDonations, color: '#0369a1', bg: '#e0f2fe' },
            { label: 'Active Requests', value: analytics.activeRequests, color: '#dc2626', bg: '#fef2f2' },
            { label: 'Available Donors', value: analytics.activeDonors, color: '#7c3aed', bg: '#f3e8ff' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', backgroundColor: s.bg }}>
              <h3 style={{ color: s.color, fontSize: '2rem', margin: '0' }}>{s.value}</h3>
              <p style={{ margin: '5px 0 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: '30px' }}>
          <h2>⚡ Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <Link to="/admin/donors" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}>👥 Manage Donors</Link>
            <Link to="/admin/requests" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}>🆘 View Requests</Link>
            <Link to="/admin/feedback-alerts" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}>💬 View Feedback</Link>
            <Link to="/admin/certificates" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}>🏆 Certificates</Link>
            <button onClick={fetchAnalytics} className="btn btn-secondary" style={{ padding: '15px' }} disabled={refreshing}>
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
            </button>
          </div>
        </div>

        <div className="card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <h2 style={{ color: '#059669' }}>🔥 System Status</h2>
          <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <div><strong>✅ Spring Boot Backend:</strong> Connected</div>
            <div><strong>✅ MySQL Database:</strong> Active</div>
            <div><strong>✅ JWT Authentication:</strong> Active</div>
            <div><strong>🔄 Last Updated:</strong> {new Date().toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
