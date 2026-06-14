import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ status: 'all', bloodGroup: '', city: '' });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRequests = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.getRequests(page, 20, filters.status === 'all' ? 'ALL' : filters.status);
      setRequests(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [page, filters.status]);

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await adminApi.updateRequestStatus(requestId, newStatus);
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesBloodGroup = !filters.bloodGroup || r.bloodGroup === filters.bloodGroup;
    const matchesCity = !filters.city || r.city?.toLowerCase().includes(filters.city.toLowerCase());
    return matchesBloodGroup && matchesCity;
  });

  const getStatusColor = (s) => ({ ACTIVE: { bg: '#fef3c7', color: '#f59e0b' }, FULFILLED: { bg: '#f0fdf4', color: '#059669' }, CANCELLED: { bg: '#fef2f2', color: '#dc2626' }, EXPIRED: { bg: '#f3f4f6', color: '#6b7280' } }[s] || { bg: '#f3f4f6', color: '#6b7280' });
  const getUrgencyColor = (u) => ({ IMMEDIATE: '#dc2626', WITHIN_24H: '#f59e0b', SCHEDULED: '#059669' }[u] || '#6b7280');

  if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '50px' }}><h2>Loading blood requests...</h2></div>;

  return (
    <div className="admin-requests">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div><h1>🆘 Blood Requests</h1><p>Monitor and manage all blood requests</p></div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <LanguageSwitcher />
            <button onClick={fetchRequests} className="btn btn-secondary" disabled={refreshing} style={{ minWidth: '100px' }}>
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
            <Link to="/admin/dashboard" className="btn btn-secondary">← Back to Dashboard</Link>
          </div>
        </div>
      </div>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {[
            { label: 'Active Requests', value: requests.filter(r => r.status === 'ACTIVE').length, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Fulfilled', value: requests.filter(r => r.status === 'FULFILLED').length, color: '#059669', bg: '#f0fdf4' },
            { label: 'Immediate', value: requests.filter(r => r.urgency === 'IMMEDIATE').length, color: '#dc2626', bg: '#fef2f2' },
            { label: 'Filtered Results', value: filteredRequests.length, color: '#0369a1', bg: '#e0f2fe' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', backgroundColor: s.bg }}>
              <h3 style={{ color: s.color, fontSize: '2rem', margin: '0' }}>{s.value}</h3>
              <p style={{ margin: '5px 0 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>All Requests ({filteredRequests.length})</h2>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Last updated: {new Date().toLocaleString()}</div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <select value={filters.status} onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(0); }} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select value={filters.bloodGroup} onChange={e => setFilters({ ...filters, bloodGroup: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
              <option value="">All Blood Groups</option>
              {['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'].map(g => (
                <option key={g} value={g}>{g.replace('_', '')}</option>
              ))}
            </select>
            <input type="text" placeholder="Filter by city..." value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', minWidth: '150px' }} />
            <button onClick={() => { setFilters({ status: 'all', bloodGroup: '', city: '' }); setPage(0); }} className="btn btn-secondary" style={{ padding: '8px 16px' }}>Clear Filters</button>
          </div>

          {filteredRequests.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    {['Patient', 'Blood Group', 'Units', 'Hospital', 'City', 'Urgency', 'Donors', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(request => {
                    const statusStyle = getStatusColor(request.status);
                    return (
                      <tr key={request.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px' }}>
                          <strong>{request.patientName}</strong><br />
                          <small style={{ color: '#6b7280' }}>ID: #{request.idStr?.slice(-6) || request.id}</small>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#fef2f2', color: '#dc2626' }}>
                            {request.bloodGroup?.replace('_', '') || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{request.unitsNeeded}</td>
                        <td style={{ padding: '12px' }}>{request.hospital}</td>
                        <td style={{ padding: '12px' }}>{request.city}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: getUrgencyColor(request.urgency), fontWeight: 'bold', fontSize: '12px' }}>{request.urgency}</span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>
                          Notified: {request.notifiedDonorsCount || 0}<br />
                          Accepted: {request.acceptedDonorsCount || 0}<br />
                          Rejected: {request.rejectedDonorsCount || 0}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                            {request.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {request.status === 'ACTIVE' && (
                            <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                              <button onClick={() => handleUpdateStatus(request.id, 'FULFILLED')} className="btn btn-primary" style={{ fontSize: '10px', padding: '4px 8px' }}>Mark Fulfilled</button>
                              <button onClick={() => handleUpdateStatus(request.id, 'CANCELLED')} className="btn btn-secondary" style={{ fontSize: '10px', padding: '4px 8px' }}>Cancel</button>
                            </div>
                          )}
                          {request.status !== 'ACTIVE' && (
                            <button onClick={() => handleUpdateStatus(request.id, 'ACTIVE')} className="btn btn-secondary" style={{ fontSize: '10px', padding: '4px 8px' }}>Reactivate</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <p>No blood requests found matching the current filters.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn btn-secondary">← Prev</button>
              <span style={{ padding: '8px 16px' }}>Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn btn-secondary">Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequestsPage;
