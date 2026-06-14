import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestApi } from '../../services/api';

const NeedyRequestCompletePage = () => {
  const navigate = useNavigate();
  const [activeRequests, setActiveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await requestApi.getMy(0, 20, 'ACTIVE');
        setActiveRequests(data.content || []);
      } catch (err) {
        console.error('Error loading requests:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleMarkComplete = async (requestId) => {
    try {
      await requestApi.fulfill(requestId);
      setActiveRequests(prev => prev.filter(r => r.id !== requestId));
      setMessage('✅ Request marked as fulfilled! Thank you for using RakhtSaathi.');
    } catch (err) {
      setMessage('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '50px' }}><h2>Loading...</h2></div>;

  return (
    <div className="needy-request-complete">
      <div className="header"><h1>✅ Mark Request Complete</h1><p>Mark your blood requests as fulfilled</p></div>
      <div className="container">
        {message && (
          <div className="card" style={{ backgroundColor: message.includes('✅') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${message.includes('✅') ? '#bbf7d0' : '#fecaca'}`, marginBottom: '20px' }}>
            <p style={{ color: message.includes('✅') ? '#059669' : '#dc2626', margin: 0, fontWeight: 'bold' }}>{message}</p>
          </div>
        )}

        <div className="card">
          <h2>Active Requests</h2>
          {activeRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎉</div>
              <h3>All requests completed!</h3>
              <p>You have no active blood requests to mark as fulfilled.</p>
              <button onClick={() => navigate('/needy/request/create')} className="btn btn-primary" style={{ marginTop: '20px' }}>Create New Request</button>
            </div>
          ) : (
            activeRequests.map(req => (
              <div key={req.id} className="card" style={{ marginBottom: '15px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4>Request #{req.idStr?.slice(-6) || req.id}</h4>
                    <p><strong>Blood Group:</strong> {req.bloodGroup?.replace('_', '')} | <strong>Units:</strong> {req.unitsNeeded}</p>
                    <p><strong>Hospital:</strong> {req.hospital}, {req.city}</p>
                    <p><strong>Accepted Donors:</strong> {req.acceptedDonorsCount || 0}</p>
                  </div>
                  <button onClick={() => handleMarkComplete(req.id)} className="btn btn-primary">✅ Mark Fulfilled</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card" style={{ backgroundColor: '#e0f2fe', border: '1px solid #0ea5e9' }}>
          <h3 style={{ color: '#0369a1' }}>📋 After Marking as Fulfilled:</h3>
          <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#0369a1' }}>
            <li>Your request will be closed and removed from active searches</li>
            <li>Donors will be notified that the request is fulfilled</li>
            <li>You can provide feedback about your experience</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NeedyRequestCompletePage;
