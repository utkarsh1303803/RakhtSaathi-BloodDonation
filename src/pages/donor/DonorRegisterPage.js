import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donorApi } from '../../services/api';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const DonorRegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '', aadhaarNumber: '', city: '', district: '',
    bloodGroup: '', age: '', weight: '', lastDonationDate: '', gender: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { updateUserProfile } = useAuth();

  const bloodGroups = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'];
  const bloodGroupLabels = { A_POSITIVE: 'A+', A_NEGATIVE: 'A-', B_POSITIVE: 'B+', B_NEGATIVE: 'B-', AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-', O_POSITIVE: 'O+', O_NEGATIVE: 'O-' };

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(formData.age) < 18) { setError('Age must be at least 18 years'); return; }
    if (parseInt(formData.weight) < 50) { setError('Weight must be at least 50 kg'); return; }
    if (formData.aadhaarNumber.length !== 12) { setError('Aadhaar number must be 12 digits'); return; }

    setLoading(true);
    setError('');
    try {
      const profile = await donorApi.createProfile({
        bloodGroup: formData.bloodGroup,
        city: formData.city,
        district: formData.district,
        phone: formData.phone,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        gender: formData.gender,
        aadhaarNumber: formData.aadhaarNumber,
        lastDonationDate: formData.lastDonationDate || null,
        isAvailable: true
      });
      updateUserProfile({ ...profile, userType: 'DONOR' }, 'DONOR');
      navigate('/donor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donor-register">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div><h1>🩸 Complete Donor Profile</h1><p>Tell us about yourself to start donating</p></div>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2>Personal Information</h2>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91XXXXXXXXXX" required />
            </div>
            <div className="form-group">
              <label>Aadhaar Number *</label>
              <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} placeholder="12-digit Aadhaar number" maxLength="12" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male / पुरुष</option>
                  <option value="Female">Female / महिला</option>
                  <option value="Other">Other / अन्य</option>
                </select>
              </div>
              <div className="form-group">
                <label>Age *</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} min="18" max="65" required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Weight (kg) *</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} min="50" required />
              </div>
              <div className="form-group">
                <label>Blood Group *</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(g => <option key={g} value={g}>{bloodGroupLabels[g]}</option>)}
                </select>
              </div>
            </div>

            <h3 style={{ marginTop: '30px' }}>Location Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>District *</label>
                <input type="text" name="district" value={formData.district} onChange={handleChange} required />
              </div>
            </div>

            <h3 style={{ marginTop: '30px' }}>Medical Information</h3>
            <div className="form-group">
              <label>Last Donation Date (if any)</label>
              <input type="date" name="lastDonationDate" value={formData.lastDonationDate} onChange={handleChange} />
              <small>Leave empty if you've never donated before</small>
            </div>

            <div className="card" style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', marginTop: '20px' }}>
              <h4>⚠️ Important Notes:</h4>
              <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                <li>You must wait 90 days between blood donations</li>
                <li>Ensure you meet all health requirements before donating</li>
              </ul>
            </div>

            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
              {loading ? 'Registering...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonorRegisterPage;
