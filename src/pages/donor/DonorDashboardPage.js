import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donorApi } from '../../services/api';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import AudioPlayer from '../../components/AudioPlayer';

const DonorDashboardPage = () => {
  const { userProfile, logout } = useAuth();
  const [availableRequests, setAvailableRequests] = useState([]);
  const [notifiedRequests, setNotifiedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [profileMissing, setProfileMissing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError('');

      // Try to fetch requests - if profile not found (404), show empty dashboard
      try {
        const [available, notified] = await Promise.all([
          donorApi.getAvailableRequests(),
          donorApi.getNotifications()
        ]);
        const notifiedIds = new Set(notified.map(r => r.id));
        setNotifiedRequests(notified);
        setAvailableRequests(available.filter(r => !notifiedIds.has(r.id)));
      } catch (err) {
        // 404 = profile not created yet, show empty dashboard with setup prompt
        if (err.response?.status === 404) {
          setNotifiedRequests([]);
          setAvailableRequests([]);
          setProfileMissing(true);
        } else {
          throw err;
        }
      }
    } catch (err) {
      setError('Failed to load dashboard: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Check eligibility from profile
  const isEligible = () => {
    if (!userProfile?.lastDonationDate) return true;
    const last = new Date(userProfile.lastDonationDate);
    const days = Math.floor((new Date() - last) / (1000 * 60 * 60 * 24));
    return days >= 90;
  };

  const getDaysUntilEligible = () => {
    if (!userProfile?.lastDonationDate) return 0;
    const last = new Date(userProfile.lastDonationDate);
    const days = Math.floor((new Date() - last) / (1000 * 60 * 60 * 24));
    return Math.max(0, 90 - days);
  };

  const getUrgencyColor = (u) => ({ IMMEDIATE: '#dc2626', WITHIN_24H: '#f59e0b', SCHEDULED: '#059669' }[u] || '#6b7280');
  const getUrgencyIcon = (u) => ({ IMMEDIATE: '🔴', WITHIN_24H: '🟡', SCHEDULED: '🟢' }[u] || '⚪');

  if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '50px' }}><h2>Loading dashboard...</h2></div>;

  if (error) return (
    <div className="error" style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Error: {error}</h2>
      <button onClick={fetchData} className="btn btn-primary">Retry</button>
    </div>
  );

  const RequestCard = ({ request, isNotified }) => (
    <div className="card" style={{ marginBottom: '15px', backgroundColor: isNotified ? '#ffffff' : '#f9fafb', border: isNotified ? '2px solid #dc2626' : '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 10px 0', color: isNotified ? '#dc2626' : '#374151' }}>
            {getUrgencyIcon(request.urgency)} {request.patientName}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '14px' }}>
            <div><strong>Blood Group:</strong> {request.bloodGroup?.replace('_', '')}</div>
            <div><strong>Units:</strong> {request.unitsNeeded}</div>
            <div><strong>Hospital:</strong> {request.hospital}</div>
            <div><strong>Urgency:</strong> <span style={{ color: getUrgencyColor(request.urgency), fontWeight: 'bold' }}>{request.urgency}</span></div>
          </div>
          {request.hasVoiceMessage && request.voiceMessageUrl && (
            <AudioPlayer audioUrl={request.voiceMessageUrl} isEmergency={request.urgency === 'IMMEDIATE'} patientName={request.patientName} />
          )}
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
            Created: {new Date(request.createdAt).toLocaleString()}
          </div>
        </div>
        <Link to={`/donor/request/${request.id}`} className="btn btn-primary" style={{ textDecoration: 'none', minWidth: '120px', textAlign: 'center' }}>
          {isNotified ? '🩸 Respond Now' : 'View Details'}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="donor-dashboard">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>🩸 Donor Dashboard</h1>
            <p>Welcome back, {userProfile?.fullName || userProfile?.name}!</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <LanguageSwitcher />
            <button onClick={fetchData} className="btn btn-secondary" disabled={refreshing} style={{ minWidth: '100px' }}>
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Profile Setup Banner */}
        {profileMissing && (
          <div className="card" style={{ marginBottom: '30px', backgroundColor: '#fff3cd', border: '2px solid #f59e0b' }}>
            <h3 style={{ color: '#856404', margin: '0 0 10px 0' }}>⚠️ Complete Your Profile</h3>
            <p style={{ color: '#856404', marginBottom: '15px' }}>
              Your donor profile is not set up yet. Please complete your profile to start receiving blood requests and helping patients.
            </p>
            <Link to="/donor/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              📝 Complete Donor Profile
            </Link>
          </div>
        )}

        {/* Status Overview */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2>Your Donation Status</h2>
          {isEligible() ? (
            <div style={{ color: '#059669', fontWeight: 'bold', fontSize: '18px' }}>✅ Eligible to Donate</div>
          ) : (
            <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '18px' }}>⏳ On Cooldown - {getDaysUntilEligible()} days remaining</div>
          )}
          <p style={{ marginTop: '10px', color: '#6b7280' }}>
            Blood Group: <strong>{userProfile?.bloodGroup?.replace('_', '')}</strong> |
            City: <strong>{userProfile?.city}</strong> |
            Available: <strong style={{ color: userProfile?.isAvailable ? '#059669' : '#dc2626' }}>{userProfile?.isAvailable ? 'Yes' : 'No'}</strong>
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {[
            { label: 'Total Donations', value: userProfile?.donationCount || 0, color: '#dc2626', bg: '#fef2f2' },
            { label: 'Rating', value: userProfile?.rating ? `${userProfile.rating.toFixed(1)}⭐` : 'N/A', color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Requests for You', value: notifiedRequests.length, color: '#0369a1', bg: '#e0f2fe' },
            { label: 'Available Requests', value: availableRequests.length, color: '#059669', bg: '#f0fdf4' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', backgroundColor: s.bg }}>
              <h3 style={{ color: s.color, fontSize: '2rem', margin: '0' }}>{s.value}</h3>
              <p style={{ margin: '5px 0 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Notified Requests */}
        {notifiedRequests.length > 0 && (
          <div className="card" style={{ marginBottom: '30px', backgroundColor: '#fef2f2', border: '2px solid #dc2626' }}>
            <h2 style={{ color: '#dc2626' }}>🚨 Requests Sent to You ({notifiedRequests.length})</h2>
            <p style={{ color: '#dc2626', marginBottom: '20px' }}>These blood requests were specifically sent to you based on your blood group and location.</p>
            {notifiedRequests.map(r => <RequestCard key={r.id} request={r} isNotified={true} />)}
          </div>
        )}

        {/* Available Requests */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2>🔍 Other Compatible Requests ({availableRequests.length})</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>Additional blood requests in your area that match your blood group compatibility.</p>
          {availableRequests.length > 0 ? (
            availableRequests.map(r => <RequestCard key={r.id} request={r} isNotified={false} />)
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <p>No additional compatible blood requests available at the moment.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2>⚡ Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <Link to="/donor/profile" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}>👤 View Profile</Link>
            <Link to="/donor/history" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}>📋 Donation History</Link>
            <Link to="/donor/health-checklist" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}>🏥 Health Checklist</Link>
            <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '15px' }} disabled={refreshing}>
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
            </button>
          </div>
        </div>

        <div className="card" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
          <h3 style={{ color: '#dc2626' }}>🚨 Emergency Contact</h3>
          <p>For urgent blood requests: <a href="tel:+919876543210" style={{ color: '#dc2626' }}>📞 +91-9876543210</a></p>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboardPage;
