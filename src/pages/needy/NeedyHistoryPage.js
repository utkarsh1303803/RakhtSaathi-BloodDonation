import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestApi } from '../../services/api';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const NeedyHistoryPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await requestApi.getMy(0, 100, 'ALL');
        setRequests(data.content || []);
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredRequests = filter === 'ALL' ? requests
    : filter === 'COMPLETED' ? requests.filter(r => r.status === 'FULFILLED')
    : requests.filter(r => r.status === filter);

  const getStatusColor = (s) => ({ ACTIVE: '#28a745', FULFILLED: '#007bff', CANCELLED: '#dc3545' }[s] || '#6c757d');
  const getUrgencyColor = (u) => ({ IMMEDIATE: '#dc3545', WITHIN_24H: '#fd7e14', SCHEDULED: '#28a745' }[u] || '#6c757d');
  const formatDate = (d) => { try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return 'N/A'; } };

  if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '50px' }}><h2>Loading history...</h2></div>;

  return (
    <div className="needy-history">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div><h1>📋 Request History</h1><p>View all your blood requests</p></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <LanguageSwitcher />
            <button onClick={() => navigate('/needy/dashboard')} className="btn btn-secondary">← Back to Dashboard</button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Filter Requests</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
            {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`btn ${filter === s ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.9rem' }}>
                {s === 'ALL' ? '📋 All' : s} ({s === 'ALL' ? requests.length : s === 'COMPLETED' ? requests.filter(r => r.status === 'FULFILLED').length : requests.filter(r => r.status === s).length})
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>📊 Request History ({filteredRequests.length})</h3>
          {filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <h4>No requests found</h4>
              {filter === 'ALL' && <button onClick={() => navigate('/needy/request/create')} className="btn btn-primary" style={{ marginTop: '15px' }}>🩸 Create First Request</button>}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    {['Patient', 'Blood & Units', 'Hospital', 'Urgency', 'Status', 'Donor Response', 'Created', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => (
                    <tr key={req.id}>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}><strong>{req.patientName}</strong></td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                        <span style={{ backgroundColor: '#dc3545', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>{req.bloodGroup?.replace('_', '')}</span>
                        <strong>{req.unitsNeeded} units</strong>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}><strong>{req.hospital}</strong><br /><small style={{ color: '#666' }}>{req.city}</small></td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}><span style={{ color: getUrgencyColor(req.urgency), fontWeight: 'bold', fontSize: '0.9rem' }}>{req.urgency}</span></td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}><span style={{ color: getStatusColor(req.status), fontWeight: 'bold' }}>{req.status}</span></td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6', fontSize: '0.8rem' }}>
                        <div>📧 {req.notifiedDonorsCount || 0}</div>
                        <div style={{ color: '#28a745' }}>✅ {req.acceptedDonorsCount || 0}</div>
                        <div style={{ color: '#dc3545' }}>❌ {req.rejectedDonorsCount || 0}</div>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}><small>{formatDate(req.createdAt)}</small></td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <button onClick={() => navigate(`/needy/request/status/${req.id}`)} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>👁️ View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {requests.length > 0 && (
          <div className="card" style={{ marginTop: '30px' }}>
            <h3>📊 Summary Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '15px' }}>
              {[
                { label: 'Total Requests', value: requests.length, color: '#007bff', bg: '#f8f9fa' },
                { label: 'Successful', value: requests.filter(r => r.status === 'FULFILLED').length, color: '#28a745', bg: '#d4edda' },
                { label: 'Total Donors Helped', value: requests.reduce((s, r) => s + (r.acceptedDonorsCount || 0), 0), color: '#856404', bg: '#fff3cd' },
                { label: 'Total Units Requested', value: requests.reduce((s, r) => s + (r.unitsNeeded || 0), 0), color: '#721c24', bg: '#f8d7da' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '15px', backgroundColor: s.bg, borderRadius: '8px' }}>
                  <h4 style={{ color: s.color, margin: '0 0 5px 0' }}>{s.value}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeedyHistoryPage;
