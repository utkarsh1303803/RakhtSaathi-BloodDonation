import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';

const AdminCertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminApi.getPendingDonations();
        setCertificates(data || []);
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (donationId) => {
    try {
      await adminApi.approveDonation(donationId);
      setCertificates(prev => prev.map(c => c.id === donationId ? { ...c, status: 'VERIFIED' } : c));
      alert('✅ Certificate approved successfully!');
    } catch (err) {
      alert('Failed to approve: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (donationId) => {
    try {
      await adminApi.rejectDonation(donationId);
      setCertificates(prev => prev.filter(c => c.id !== donationId));
      alert('Certificate rejected.');
    } catch (err) {
      alert('Failed to reject: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="loading">Loading certificates...</div>;

  const pendingCertificates = certificates.filter(c => c.status === 'PENDING');

  return (
    <div className="admin-certificates">
      <div className="header">
        <h1>🏆 Certificate Approvals</h1>
        <p>Review and approve donation certificates</p>
      </div>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {[
            { label: 'Pending Approvals', value: pendingCertificates.length, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Total Donations', value: certificates.length, color: '#0369a1', bg: '#e0f2fe' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', backgroundColor: s.bg }}>
              <h3 style={{ color: s.color, fontSize: '2rem', margin: '0' }}>{s.value}</h3>
              <p style={{ margin: '5px 0 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>Pending Approvals ({pendingCertificates.length})</h2>
          {pendingCertificates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No certificates pending approval.</p>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              {pendingCertificates.map(cert => (
                <div key={cert.id} className="card" style={{ marginBottom: '20px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4>Certificate #{cert.certificateNumber || cert.certificateId}</h4>
                      <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <div><strong>Donor:</strong> {cert.donorName}</div>
                        <div><strong>Hospital:</strong> {cert.hospitalName || cert.hospital}</div>
                        <div><strong>Donation Date:</strong> {cert.donationDate ? new Date(cert.donationDate).toLocaleDateString() : 'N/A'}</div>
                        <div><strong>Request ID:</strong> #{cert.requestIdStr?.slice(-6) || 'N/A'}</div>
                        <div><strong>Units:</strong> {cert.units || 1}</div>
                        <div><strong>Status:</strong> <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{cert.status}</span></div>
                      </div>
                      {cert.proofImageUrl && (
                        <div style={{ marginTop: '15px' }}>
                          <strong>Proof Image:</strong>
                          <div style={{ marginTop: '10px' }}>
                            <img src={cert.proofImageUrl} alt="Donation proof" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button onClick={() => handleApprove(cert.id)} className="btn btn-primary" style={{ width: '120px' }}>✅ Approve</button>
                      <button onClick={() => handleReject(cert.id)} className="btn btn-secondary" style={{ width: '120px' }}>❌ Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCertificatesPage;
