import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { donorApi } from '../../services/api';

const DonorProofUploadPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ hospitalName: '', donationDate: new Date().toISOString().split('T')[0], notes: '' });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    try {
      await donorApi.recordDonation({
        requestId: requestId ? parseInt(requestId) : null,
        hospitalName: formData.hospitalName,
        donationDate: formData.donationDate,
        notes: formData.notes,
        units: 1
      });
      navigate('/donor/dashboard', { state: { message: 'Donation recorded successfully! Your certificate will be available once approved.' } });
    } catch (err) {
      setError('Failed to record donation: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="donor-proof-upload">
      <div className="header"><h1>📸 Record Donation</h1><p>Request #{requestId?.slice(-6) || requestId}</p></div>
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2>Donation Details</h2>
            <div className="form-group">
              <label>Hospital Name *</label>
              <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleInputChange} placeholder="Enter the hospital name where you donated" required />
            </div>
            <div className="form-group">
              <label>Donation Date *</label>
              <input type="date" name="donationDate" value={formData.donationDate} onChange={handleInputChange} max={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="form-group">
              <label>Additional Notes (Optional)</label>
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" placeholder="Any additional information about the donation..." />
            </div>

            {error && <div className="error">{error}</div>}

            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button type="button" onClick={() => navigate('/donor/dashboard')} className="btn btn-secondary" disabled={uploading} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={uploading} style={{ flex: 1 }}>
                {uploading ? 'Recording...' : 'Record Donation'}
              </button>
            </div>
          </form>
        </div>

        <div className="card" style={{ marginTop: '30px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <h4 style={{ color: '#059669' }}>🎉 What Happens Next?</h4>
          <ol style={{ marginTop: '10px', paddingLeft: '20px', color: '#059669' }}>
            <li>Your donation will be reviewed by our admin team</li>
            <li>You'll receive a notification once approved (usually within 24 hours)</li>
            <li>Your verified donation certificate will be generated</li>
            <li>Your donation count and rating will be updated</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DonorProofUploadPage;
