import { useState, useEffect } from 'react';
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { requestApi } from '../../services/api';
import NeedyLiveTracking from '../../components/NeedyLiveTracking';

class TrackingErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ padding: '15px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', marginBottom: '15px' }}>
        ⚠️ Live map unavailable. Donor is on the way - please wait for their call.
      </div>
    );
    return this.props.children;
  }
}

const NeedyRequestStatusPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [triggering, setTriggering] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState('');

  const fetchRequest = async () => {
    try {
      const data = await requestApi.getById(id);
      setRequest(data);
      setError('');
    } catch (err) {
      setError('Failed to load request: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequest();
      const interval = setInterval(fetchRequest, 60000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const handleManualTrigger = async () => {
    setTriggering(true);
    setTriggerMsg('');
    try {
      const count = await requestApi.triggerNotification(id);
      setTriggerMsg(`✅ Notified ${count} donors`);
      setTimeout(fetchRequest, 2000);
    } catch (err) {
      setTriggerMsg(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setTriggering(false);
      setTimeout(() => setTriggerMsg(''), 10000);
    }
  };

  if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '50px' }}><h2>Loading request status...</h2></div>;
  if (error || !request) return (
    <div className="container"><div className="card">
      <h2>Request Not Found</h2><p>{error}</p>
      <Link to="/needy/dashboard" className="btn btn-primary">Back to Dashboard</Link>
    </div></div>
  );

  // Build donor lists from notifiedDonors map
  const notifiedDonors = request.notifiedDonors || {};
  const allDonors = Object.entries(notifiedDonors).map(([donorId, data]) => ({ id: donorId, ...data }));
  const acceptedDonors = allDonors.filter(d => d.status === 'ACCEPTED');
  const rejectedDonors = allDonors.filter(d => d.status === 'REJECTED');
  const pendingDonors = allDonors.filter(d => d.status === 'NOTIFIED');

  return (
    <div className="needy-request-status">
      <div className="header"><h1>🆘 Request Status</h1><p>Request #{request.idStr?.slice(-6) || request.id} - Live Updates</p></div>

      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Request Details</h2>
            <div style={{ padding: '8px 16px', borderRadius: '20px', backgroundColor: request.urgency === 'IMMEDIATE' ? '#fef2f2' : '#fef3c7', color: request.urgency === 'IMMEDIATE' ? '#dc2626' : '#f59e0b', fontWeight: 'bold' }}>
              {request.urgency}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div><strong>Blood Group:</strong> {request.bloodGroup?.replace('_', '')}</div>
            <div><strong>Units:</strong> {request.unitsNeeded}</div>
            <div><strong>Hospital:</strong> {request.hospital}</div>
            <div><strong>City:</strong> {request.city}</div>
            <div><strong>Patient:</strong> {request.patientName}</div>
            <div><strong>Status:</strong> <span style={{ color: request.status === 'FULFILLED' ? '#059669' : '#f59e0b', fontWeight: 'bold' }}>{request.status}</span></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {[
            { label: 'Donors Notified', value: request.notifiedDonorsCount || 0, color: '#0369a1', bg: '#e0f2fe' },
            { label: 'Accepted', value: acceptedDonors.length, color: '#059669', bg: '#f0fdf4' },
            { label: 'Rejected', value: rejectedDonors.length, color: '#dc2626', bg: '#fef2f2' },
            { label: 'Pending', value: pendingDonors.length, color: '#f59e0b', bg: '#fef3c7' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', backgroundColor: s.bg }}>
              <h3 style={{ color: s.color, fontSize: '2rem', margin: '0' }}>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          ))}
        </div>

        {acceptedDonors.length > 0 && (
          <div className="card">
            <h3 style={{ color: '#059669' }}>✅ Donors Who Accepted ({acceptedDonors.length})</h3>
            {acceptedDonors.map((donor, i) => (
              <div key={donor.id}>
                <div className="card" style={{ marginBottom: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <h4>{donor.donorInfo?.fullName || `Donor #${i + 1}`}</h4>
                  <p><strong>Blood Group:</strong> {donor.donorInfo?.bloodGroup}</p>
                  <p><strong>City:</strong> {donor.donorInfo?.city}</p>
                  {donor.donorInfo?.phone && (
                    <p><strong>Contact:</strong> <a href={`tel:${donor.donorInfo.phone}`} style={{ color: '#059669' }}>📞 {donor.donorInfo.phone}</a></p>
                  )}
                </div>

                {/* 🗺️ LIVE TRACKING - Rapido/Uber style */}
                <TrackingErrorBoundary>
                  <NeedyLiveTracking
                    requestId={parseInt(id)}
                    donorInfo={{
                      name: donor.donorInfo?.fullName,
                      phone: donor.donorInfo?.phone,
                      bloodGroup: donor.donorInfo?.bloodGroup
                    }}
                  />
                </TrackingErrorBoundary>
              </div>
            ))}
          </div>
        )}

        {pendingDonors.length > 0 && (
          <div className="card">
            <h3 style={{ color: '#f59e0b' }}>⏳ Waiting for Response ({pendingDonors.length})</h3>
            {pendingDonors.map((donor, i) => (
              <div key={donor.id} className="card" style={{ marginBottom: '10px', backgroundColor: '#fef3c7', border: '1px solid #fcd34d' }}>
                <h4>{donor.donorInfo?.fullName || `Donor #${i + 1}`}</h4>
                <p><strong>Blood Group:</strong> {donor.donorInfo?.bloodGroup} | <strong>City:</strong> {donor.donorInfo?.city}</p>
              </div>
            ))}
          </div>
        )}

        {allDonors.length === 0 && (
          <div className="card">
            <h3>⏳ Searching for Donors</h3>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
              <p style={{ fontSize: '1.2rem' }}>We're searching for compatible donors in your area...</p>
            </div>
          </div>
        )}

        <div className="card">
          <h3>📞 Contact Information</h3>
          <p><strong>Attendant:</strong> {request.attendantName}</p>
          <p><strong>Phone:</strong> {request.contactNumber}</p>
          <p><strong>Hospital:</strong> {request.hospital}, {request.city}</p>
        </div>

        <div className="card">
          <h3>Actions</h3>
          <div style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
            <h4 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>🔧 Manual Notification Trigger</h4>
            <p style={{ color: '#dc2626', fontSize: '14px', margin: '0 0 15px 0' }}>Click to manually find and notify donors.</p>
            <button onClick={handleManualTrigger} disabled={triggering} className="btn btn-primary" style={{ backgroundColor: triggering ? '#6b7280' : '#dc2626' }}>
              {triggering ? 'Finding Donors...' : '🔔 Find & Notify Donors Now'}
            </button>
            {triggerMsg && (
              <div style={{ marginTop: '10px', padding: '10px', borderRadius: '4px', backgroundColor: triggerMsg.includes('✅') ? '#d1fae5' : '#fee2e2', color: triggerMsg.includes('✅') ? '#065f46' : '#dc2626', fontSize: '14px' }}>
                {triggerMsg}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {acceptedDonors.length > 0 && request.status !== 'FULFILLED' && (
              <Link to="/needy/request/complete" className="btn btn-primary" style={{ textDecoration: 'none' }}>✅ Mark as Fulfilled</Link>
            )}
            {acceptedDonors.length > 0 && (
              <Link to={`/needy/feedback/${id}`} className="btn btn-secondary" style={{ textDecoration: 'none' }}>⭐ Give Feedback</Link>
            )}
            <button onClick={fetchRequest} className="btn btn-secondary">🔄 Refresh Status</button>
            <Link to="/needy/dashboard" className="btn btn-secondary" style={{ textDecoration: 'none' }}>📊 Back to Dashboard</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>🔄 This page updates automatically every 60 seconds.</p>
        </div>
      </div>
    </div>
  );
};

export default NeedyRequestStatusPage;
