import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { needyApi } from '../../services/api';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const NeedyProfilePage = () => {
  const navigate = useNavigate();
  const { userProfile, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    city: userProfile?.city || '',
    age: userProfile?.age || '',
    gender: userProfile?.gender || '',
    relationToPatient: userProfile?.relationToPatient || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
    state: userProfile?.state || '',
    pincode: userProfile?.pincode || '',
    emergencyContactName: userProfile?.emergencyContactName || '',
    emergencyContactPhone: userProfile?.emergencyContactPhone || '',
    emergencyContactRelation: userProfile?.emergencyContactRelation || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const updated = await needyApi.updateProfile({
        city: formData.city,
        age: parseInt(formData.age),
        gender: formData.gender,
        relationToPatient: formData.relationToPatient,
        phone: formData.phone,
        address: formData.address,
        state: formData.state,
        pincode: formData.pincode,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelation: formData.emergencyContactRelation
      });
      updateUserProfile({ ...updated, userType: 'NEEDY' }, 'NEEDY');
      setSuccess('✅ Profile updated successfully!');
    } catch (err) {
      setError('Failed to update: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="needy-profile">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div><h1>👤 My Profile</h1><p>Update your personal information</p></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <LanguageSwitcher />
            <button onClick={() => navigate('/needy/dashboard')} className="btn btn-secondary">← Back to Dashboard</button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h3>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={userProfile?.email || ''} disabled style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }} />
                <small style={{ color: '#666' }}>Email cannot be changed</small>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Age *</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} min="1" max="120" required />
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Relation to Patient *</label>
              <select name="relationToPatient" value={formData.relationToPatient} onChange={handleChange} required>
                <option value="">Select</option>
                {['Self', 'Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Friend', 'Other'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <h3 style={{ marginTop: '30px' }}>Address Information</h3>
            <div className="form-group">
              <label>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="3" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '15px' }}>
              <div className="form-group"><label>State</label><input type="text" name="state" value={formData.state} onChange={handleChange} /></div>
              <div className="form-group"><label>Pincode</label><input type="text" name="pincode" value={formData.pincode} onChange={handleChange} /></div>
            </div>

            <h3 style={{ marginTop: '30px' }}>Emergency Contact</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 150px', gap: '15px' }}>
              <div className="form-group"><label>Contact Name</label><input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} /></div>
              <div className="form-group"><label>Contact Phone</label><input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} /></div>
              <div className="form-group">
                <label>Relation</label>
                <select name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleChange}>
                  <option value="">Select</option>
                  {['SPOUSE', 'PARENT', 'SIBLING', 'CHILD', 'FRIEND', 'OTHER'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {error && <div className="error" style={{ marginTop: '20px' }}>{error}</div>}
            {success && <div style={{ marginTop: '20px', backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', border: '1px solid #c3e6cb' }}>{success}</div>}

            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Updating...' : '✅ Update Profile'}</button>
              <button type="button" onClick={() => navigate('/needy/dashboard')} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NeedyProfilePage;
