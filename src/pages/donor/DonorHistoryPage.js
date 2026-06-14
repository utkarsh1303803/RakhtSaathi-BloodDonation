import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { donorApi } from '../../services/api';

const DonorHistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ year: 'all', status: 'all' });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await donorApi.getHistory();
        setHistory(data || []);
      } catch (err) {
        console.error('Error fetching donation history:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredHistory = history.filter(item => {
    if (filter.year !== 'all') {
      const itemYear = new Date(item.donationDate).getFullYear().toString();
      if (itemYear !== filter.year) return false;
    }
    if (filter.status !== 'all' && item.status !== filter.status) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    const styles = {
      VERIFIED: { backgroundColor: '#f0fdf4', color: '#059669', text: '✅ Verified' },
      PENDING: { backgroundColor: '#fef3c7', color: '#f59e0b', text: '⏳ Pending' },
      REJECTED: { backgroundColor: '#fef2f2', color: '#dc2626', text: '❌ Rejected' }
    };
    const style = styles[status] || styles.PENDING;
    return <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', ...style }}>{style.text}</span>;
  };

  if (loading) return <div className="loading">Loading donation history...</div>;

  return (
    <div className="donor-history">
      <div className="header">
        <h1>📋 Donation History</h1>
        <p>Your complete blood donation record</p>
      </div>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {[
            { label: 'Total Donations', value: history.length },
            { label: 'Verified Donations', value: history.filter(h => h.status === 'VERIFIED').length },
            { label: 'Total Units', value: history.reduce((s, h) => s + (h.units || 1), 0) },
            { label: 'Pending Approval', value: history.filter(h => h.status === 'PENDING').length },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#dc2626', fontSize: '2rem' }}>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>Filter History</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '15px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Year:</label>
              <select value={filter.year} onChange={e => setFilter({ ...filter, year: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                <option value="all">All Years</option>
                {[...new Set(history.map(h => new Date(h.donationDate).getFullYear()))].sort((a, b) => b - a).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Status:</label>
              <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                <option value="all">All Status</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Donation Records ({filteredHistory.length})</h3>
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No donation records found.</p>
              <Link to="/donor/dashboard" className="btn btn-primary" style={{ textDecoration: 'none', marginTop: '15px' }}>Back to Dashboard</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    {['Date', 'Hospital', 'Request ID', 'Units', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map(record => (
                    <tr key={record.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px' }}>{new Date(record.donationDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>{record.hospitalName}</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>#{record.requestIdStr?.slice(-6) || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{record.units || 1}</td>
                      <td style={{ padding: '12px' }}>{getStatusBadge(record.status)}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {record.proofImageUrl && (
                            <a href={record.proofImageUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#dc2626', textDecoration: 'none', padding: '4px 8px', border: '1px solid #dc2626', borderRadius: '4px' }}>📸 View Proof</a>
                          )}
                          {record.certificateId && record.status === 'VERIFIED' && (
                            <Link to={`/donor/certificate/${record.certificateId}`} style={{ fontSize: '12px', color: '#059669', textDecoration: 'none', padding: '4px 8px', border: '1px solid #059669', borderRadius: '4px' }}>🏆 Certificate</Link>
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

        {history.length > 0 && (
          <div className="card">
            <h3>🏆 Your Achievements</h3>
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
              {history.length >= 1 && <div style={{ padding: '10px 15px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>🥉 First Donation</div>}
              {history.length >= 5 && <div style={{ padding: '10px 15px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>🥈 5 Donations</div>}
              {history.length >= 10 && <div style={{ padding: '10px 15px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>🥇 10 Donations</div>}
              {history.filter(h => h.status === 'VERIFIED').length >= 3 && <div style={{ padding: '10px 15px', backgroundColor: '#f0fdf4', color: '#059669', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>✅ Verified Donor</div>}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link to="/donor/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default DonorHistoryPage;
