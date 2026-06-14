import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { donorApi } from '../../services/api';

const DonorCertificatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await donorApi.getCertificate(id);
        setCertificate(data);
      } catch (err) {
        setError('Certificate not found: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="loading">Loading certificate...</div>;
  if (error || !certificate) return (
    <div className="container"><div className="card">
      <h2>Certificate Not Found</h2>
      <p style={{ color: '#dc2626' }}>{error}</p>
      <button onClick={() => navigate('/donor/history')} className="btn btn-primary">Back to History</button>
    </div></div>
  );

  return (
    <div className="donor-certificate">
      <div className="header no-print">
        <h1>🏆 Donation Certificate</h1>
        <p>Certificate #{certificate.certificateNumber || certificate.certificateId}</p>
      </div>

      <div className="container">
        <div className="certificate-container" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', border: '2px solid #dc2626', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ color: '#dc2626', fontSize: '2.5rem', marginBottom: '10px' }}>🩸 RakhtSaathi</h1>
            <h2 style={{ color: '#374151', fontSize: '1.8rem' }}>Certificate of Blood Donation</h2>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '30px', margin: '30px 0', backgroundColor: '#fef2f2' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>This is to certify that</p>
            <h3 style={{ fontSize: '2rem', color: '#dc2626', margin: '20px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
              {certificate.donorName}
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: '20px 0' }}>
              has voluntarily donated <strong>{certificate.units || 1} unit(s)</strong> of blood on
            </p>
            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#dc2626' }}>
              {certificate.donationDate ? new Date(certificate.donationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </p>
            <p style={{ fontSize: '1.1rem', marginTop: '20px' }}>
              at <strong>{certificate.hospitalName || certificate.hospital}</strong>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px', textAlign: 'left' }}>
            <div>
              <p><strong>Certificate Number:</strong></p>
              <p style={{ color: '#dc2626', fontFamily: 'monospace' }}>{certificate.certificateNumber || certificate.certificateId}</p>
            </div>
            <div>
              <p><strong>Issue Date:</strong></p>
              <p>{certificate.issuedDate ? new Date(certificate.issuedDate).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Status: <strong style={{ color: certificate.status === 'VERIFIED' ? '#059669' : '#f59e0b' }}>{certificate.status}</strong></p>
          </div>
        </div>

        <div className="actions no-print" style={{ textAlign: 'center', marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button onClick={() => window.print()} className="btn btn-secondary">🖨️ Print Certificate</button>
          <button onClick={() => navigate('/donor/history')} className="btn btn-primary">← Back to History</button>
        </div>
      </div>

      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
};

export default DonorCertificatePage;
