import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { needyApi } from '../../services/api';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const NeedyRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', city: '', age: '', gender: '', relationToPatient: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { updateUserProfile } = useAuth();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Check if token exists
      const token = localStorage.getItem('jwt_token');
      console.log('Token present:', !!token, 'Token:', token?.substring(0, 30));
      
      const profile = await needyApi.createProfile(
        formData.city,
        parseInt(formData.age),
        formData.gender,
        formData.relationToPatient
      );
      updateUserProfile({ ...profile, userType: 'NEEDY' }, 'NEEDY');
      navigate('/needy/request/create');
    } catch (err) {
      console.error('Profile creation error details:', err.response?.status, err.response?.data);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="needy-register">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div><h1>🆘 Complete Your Profile</h1><p>Tell us about yourself</p></div>
          <LanguageSwitcher />
        </div>
      </div>
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2>Personal Information</h2>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Age *</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} min="1" max="120" required />
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male / पुरुष</option>
                  <option value="Female">Female / महिला</option>
                  <option value="Other">Other / अन्य</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>City *</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Relation to Patient *</label>
              <select name="relationToPatient" value={formData.relationToPatient} onChange={handleChange} required>
                <option value="">Select Relation</option>
                <option value="Self">Self / स्वयं</option>
                <option value="Father">Father / पिता</option>
                <option value="Mother">Mother / माता</option>
                <option value="Spouse">Spouse / पति/पत्नी</option>
                <option value="Son">Son / पुत्र</option>
                <option value="Daughter">Daughter / पुत्री</option>
                <option value="Brother">Brother / भाई</option>
                <option value="Sister">Sister / बहन</option>
                <option value="Friend">Friend / मित्र</option>
                <option value="Other">Other / अन्य</option>
              </select>
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

export default NeedyRegisterPage;
