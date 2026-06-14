import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestApi } from '../../services/api';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const NeedyDashboardPage = () => {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRequests: 0, activeRequests: 0, completedRequests: 0, cancelledRequests: 0 });

  useEffect(() => { loadMyRequests(); }, []);

  const loadMyRequests = async () => {
    try {
      const data = await requestApi.getMy(0, 20, 'ALL');
      const requests = data.content || [];
      setMyRequests(requests);
      setStats({
        totalRequests: data.totalElements || 0,
        activeRequests: requests.filter(r => r.status === 'ACTIVE').length,
        completedRequests: requests.filter(r => r.status === 'FULFILLED').length,
        cancelledRequests: requests.filter(r => r.status === 'CANCELLED').length
      });
    } catch (error) {
      // 404 = profile not created yet, show empty dashboard
      if (error.response?.status !== 404) {
        console.error('Error loading requests:', error);
      }
      setMyRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this blood request?')) return;
    try {
      await requestApi.cancel(requestId);
      loadMyRequests();
      alert('✅ Blood request cancelled successfully');
    } catch (error) {
      alert('❌ Failed to cancel: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#28a745';
      case 'FULFILLED': return '#007bff';
      case 'CANCELLED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try { return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return 'N/A'; }
  };

  if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '50px' }}><h2>Loading dashboard...</h2></div>;

  return (
    <div className="needy-dashboard">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>🆘 Needy Dashboard</h1>
            <p>Welcome back, {userProfile?.fullName || userProfile?.name || 'User'}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <LanguageSwitcher />
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626', marginBottom: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626' }}>🚨 Emergency? Call Immediately!</h3>
            <p style={{ color: '#dc2626', marginTop: '10px' }}>📞 +91-9876543210</p>
          </div>
        </div>

        {/* Profile Setup Banner */}
        {!userProfile?.phone && (
          <div className="card" style={{ marginBottom: '30px', backgroundColor: '#fff3cd', border: '2px solid #f59e0b' }}>
            <h3 style={{ color: '#856404', margin: '0 0 10px 0' }}>⚠️ Complete Your Profile</h3>
            <p style={{ color: '#856404', marginBottom: '15px' }}>
              Please complete your profile to create blood requests and get faster help.
            </p>
            <button onClick={() => navigate('/needy/register')} className="btn btn-primary">
              📝 Complete Profile
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {[
            { label: 'Total Requests', value: stats.totalRequests, color: '#007bff', bg: '#f8f9fa' },
            { label: 'Active Requests', value: stats.activeRequests, color: '#28a745', bg: '#d4edda' },
            { label: 'Completed', value: stats.completedRequests, color: '#007bff', bg: '#d1ecf1' },
            { label: 'Cancelled', value: stats.cancelledRequests, color: '#dc3545', bg: '#f8d7da' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', backgroundColor: s.bg }}>
              <h3 style={{ color: s.color, margin: '0 0 10px 0' }}>{s.value}</h3>
              <p style={{ margin: 0, color: '#666' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: '30px' }}>
          <h3>🚀 Quick Actions</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
            <button onClick={() => navigate('/needy/request/create')} className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '12px 24px' }}>
              🩸 Create New Blood Request
            </button>
            <button onClick={() => navigate('/needy/profile')} className="btn btn-secondary">👤 View Profile</button>
            <button onClick={() => navigate('/needy/history')} className="btn btn-secondary">📋 Request History</button>
          </div>
        </div>

        <div className="card">
          <h3>📋 My Blood Requests</h3>
          {myRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <h4>No blood requests yet</h4>
              <button onClick={() => navigate('/needy/request/create')} className="btn btn-primary" style={{ marginTop: '15px' }}>
                🩸 Create Blood Request
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    {['Patient', 'Blood Group', 'Units', 'Hospital', 'Status', 'Created', 'Donors', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map(request => (
                    <tr key={request.id}>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}><strong>{request.patientName}</strong></td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <span style={{ backgroundColor: '#dc3545', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>
                          {request.bloodGroup?.replace('_', '')}
                        </span>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{request.unitsNeeded} units</td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{request.hospital}<br /><small style={{ color: '#666' }}>{request.city}</small></td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <span style={{ color: getStatusColor(request.status), fontWeight: 'bold' }}>{request.status}</span>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}><small>{formatDate(request.createdAt)}</small></td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6', fontSize: '0.9rem' }}>
                        <div>📧 {request.notifiedDonorsCount || 0}</div>
                        <div>✅ {request.acceptedDonorsCount || 0}</div>
                        <div>❌ {request.rejectedDonorsCount || 0}</div>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <button onClick={() => navigate(`/needy/request/status/${request.id}`)} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>👁️ View</button>
                          {request.status === 'ACTIVE' && (
                            <button onClick={() => handleCancelRequest(request.id)} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>❌ Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: '30px' }}>
          <h3>👤 Profile Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div><strong>Name:</strong> {userProfile?.fullName || userProfile?.name || 'N/A'}</div>
            <div><strong>Email:</strong> {userProfile?.email || 'N/A'}</div>
            <div><strong>Phone:</strong> {userProfile?.phone || 'N/A'}</div>
            <div><strong>City:</strong> {userProfile?.city || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeedyDashboardPage;
