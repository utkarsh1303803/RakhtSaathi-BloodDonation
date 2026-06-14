import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const AdminDonorsPage = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ city: '', bloodGroup: '', status: 'all' });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchDonors = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.getDonors(page, 20);
      setDonors(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Error fetching donors:', err);
      setDonors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDonors(); }, [page]);

  const handleToggleAvailability = async (donorId) => {
    try {
      const updated = await adminApi.toggleDonorAvailability(donorId);
      setDonors(prev => prev.map(d => d.id === donorId ? { ...d, isAvailable: updated.isAvailable } : d));
    } catch (err) {
      alert('Failed to update donor: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredDonors = donors.filter(d => {
    const matchesCity = !filters.city || d.city?.toLowerCase().includes(filters.city.toLowerCase());
    const matchesBloodGroup = !filters.bloodGroup || d.bloodGroup === filters.bloodGroup;
    const matchesStatus = filters.status === 'all' || (filters.status === 'available' && d.isAvailable) || (filters.status === 'unavailable' && !d.isAvailable);
    return matchesCity && matchesBloodGroup && matchesStatus;
  });

  if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '50px' }}><h2>Loading donors...</h2></div>;

  return (
    <div className="admin-donors">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div><h1>👥 Manage Donors</h1><p>View and manage all registered blood donors</p></div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <LanguageSwitcher />
            <button onClick={fetchDonors} className="btn btn-secondary" disabled={refreshing} style={{ minWidth: '100px' }}>
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
            <Link to="/admin/dashboard" className="btn btn-secondary">← Back to Dashboard</Link>
          </div>
        </div>
      </div>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {[
            { label: 'Total Donors', value: donors.length, color: '#059669', bg: '#f0fdf4' },
            { label: 'Available Donors', value: donors.filter(d => d.isAvailable).length, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Unavailable Donors', value: donors.filter(d => !d.isAvailable).length, color: '#dc2626', bg: '#fef2f2' },
            { label: 'Filtered Results', value: filteredDonors.length, color: '#0369a1', bg: '#e0f2fe' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', backgroundColor: s.bg }}>
              <h3 style={{ color: s.color, fontSize: '2rem', margin: '0' }}>{s.value}</h3>
              <p style={{ margin: '5px 0 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Donor List ({filteredDonors.length})</h2>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Last updated: {new Date().toLocaleString()}</div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Filter by city..." value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', minWidth: '150px' }} />
            <select value={filters.bloodGroup} onChange={e => setFilters({ ...filters, bloodGroup: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
              <option value="">All Blood Groups</option>
              {['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'].map(g => (
                <option key={g} value={g}>{g.replace('_', '')}</option>
              ))}
            </select>
            <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <button onClick={() => setFilters({ city: '', bloodGroup: '', status: 'all' })} className="btn btn-secondary" style={{ padding: '8px 16px' }}>Clear Filters</button>
          </div>

          {filteredDonors.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    {['Name', 'Email', 'Phone', 'City', 'Blood Group', 'Donations', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDonors.map(donor => (
                    <tr key={donor.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px' }}>
                        <strong>{donor.fullName || donor.name}</strong><br />
                        <small style={{ color: '#6b7280' }}>Age: {donor.age || 'N/A'}</small>
                      </td>
                      <td style={{ padding: '12px' }}><small>{donor.email}</small></td>
                      <td style={{ padding: '12px' }}>{donor.phone || donor.contactNumber}</td>
                      <td style={{ padding: '12px' }}>{donor.city}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#fef2f2', color: '#dc2626' }}>
                          {donor.bloodGroup?.replace('_', '') || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {donor.donationCount || 0} times<br />
                        <small style={{ color: '#6b7280' }}>Rating: {donor.rating ? donor.rating.toFixed(1) : 'N/A'}⭐</small>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: donor.isAvailable ? '#f0fdf4' : '#fef2f2', color: donor.isAvailable ? '#059669' : '#dc2626' }}>
                          {donor.isAvailable ? '✅ Available' : '❌ Unavailable'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => handleToggleAvailability(donor.id)} className={`btn ${donor.isAvailable ? 'btn-secondary' : 'btn-primary'}`} style={{ fontSize: '12px', padding: '6px 12px' }}>
                          {donor.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <p>No donors found matching the current filters.</p>
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

export default AdminDonorsPage;
