import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import VoiceRecorder from '../../components/VoiceRecorder';

const NeedyRequestCreatePage = () => {
  const [formData, setFormData] = useState({
    bloodGroup: '', units: 1, urgency: 'IMMEDIATE', hospital: '', city: '',
    patientName: '', attendantName: '', attendantPhone: '', additionalNotes: ''
  });
  const [compatibleGroups, setCompatibleGroups] = useState([]);
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const bloodGroups = [
    { value: 'A_POSITIVE', label: 'A+' }, { value: 'A_NEGATIVE', label: 'A-' },
    { value: 'B_POSITIVE', label: 'B+' }, { value: 'B_NEGATIVE', label: 'B-' },
    { value: 'AB_POSITIVE', label: 'AB+' }, { value: 'AB_NEGATIVE', label: 'AB-' },
    { value: 'O_POSITIVE', label: 'O+' }, { value: 'O_NEGATIVE', label: 'O-' }
  ];

  const compatibilityMap = {
    'A_POSITIVE': ['A+', 'A-', 'O+', 'O-'], 'A_NEGATIVE': ['A-', 'O-'],
    'B_POSITIVE': ['B+', 'B-', 'O+', 'O-'], 'B_NEGATIVE': ['B-', 'O-'],
    'AB_POSITIVE': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB_NEGATIVE': ['A-', 'B-', 'AB-', 'O-'], 'O_POSITIVE': ['O+', 'O-'], 'O_NEGATIVE': ['O-']
  };

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleBloodGroupChange = e => {
    const val = e.target.value;
    setFormData({ ...formData, bloodGroup: val });
    if (val) { setCompatibleGroups(compatibilityMap[val] || []); setShowCompatibility(true); }
    else setShowCompatibility(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const required = ['patientName', 'bloodGroup', 'hospital', 'city', 'attendantName', 'attendantPhone'];
    const missing = required.filter(f => !formData[f]?.trim());
    if (missing.length > 0) { setError(`Please fill: ${missing.join(', ')}`); setLoading(false); return; }

    try {
      const requestData = {
        patientName: formData.patientName.trim(),
        bloodGroup: formData.bloodGroup,
        unitsNeeded: parseInt(formData.units),
        urgency: formData.urgency,
        hospital: formData.hospital.trim(),
        city: formData.city.trim(),
        attendantName: formData.attendantName.trim(),
        contactNumber: formData.attendantPhone.trim(),
        additionalNotes: formData.additionalNotes.trim()
      };

      const result = await requestApi.create(requestData);
      navigate(`/needy/request/status/${result.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="needy-request-create">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div><h1>🆘 Create Blood Request</h1><p>Emergency blood request</p></div>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626', marginBottom: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626' }}>🚨 Life-Threatening Emergency</h3>
            <p style={{ color: '#dc2626', marginTop: '10px' }}>Call Emergency Helpline: <strong>+91-9876543210</strong></p>
          </div>
        </div>

        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2>Blood Requirement Details</h2>

            <div className="form-group">
              <label>Patient Name *</label>
              <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Blood Group *</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleBloodGroupChange} required>
                  <option value="">Select</option>
                  {bloodGroups.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Units Required *</label>
                <select name="units" value={formData.units} onChange={handleChange} required>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Unit{n>1?'s':''}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Urgency Level *</label>
                <select name="urgency" value={formData.urgency} onChange={handleChange} required>
                  <option value="IMMEDIATE">🔴 Immediate</option>
                  <option value="WITHIN_24H">🟡 Within 24 Hours</option>
                  <option value="SCHEDULED">🟢 Scheduled</option>
                </select>
              </div>
            </div>

            {showCompatibility && compatibleGroups.length > 0 && (
              <div className="card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', marginTop: '10px' }}>
                <h4 style={{ color: '#059669' }}>💡 Compatible Blood Groups:</h4>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {compatibleGroups.map(g => (
                    <span key={g} style={{ padding: '4px 12px', backgroundColor: '#bbf7d0', color: '#059669', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>{g}</span>
                  ))}
                </div>
              </div>
            )}

            {formData.urgency === 'IMMEDIATE' && (
              <div style={{ margin: '20px 0', border: '2px solid #dc3545', borderRadius: '8px', padding: '20px' }}>
                <h4 style={{ color: '#856404' }}>🎙️ Emergency Voice Message (Optional)</h4>
                <VoiceRecorder onRecordingComplete={setVoiceBlob} maxDuration={60} />
              </div>
            )}

            <h3 style={{ marginTop: '30px' }}>Hospital Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Hospital Name *</label>
                <input type="text" name="hospital" value={formData.hospital} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
              </div>
            </div>

            <h3 style={{ marginTop: '20px' }}>Contact Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Attendant Name *</label>
                <input type="text" name="attendantName" value={formData.attendantName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Attendant Phone *</label>
                <input type="tel" name="attendantPhone" value={formData.attendantPhone} onChange={handleChange} placeholder="+91XXXXXXXXXX" required />
              </div>
            </div>

            <div className="form-group">
              <label>Additional Notes (Optional)</label>
              <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleChange} rows="3" />
            </div>

            {error && <div className="error" style={{ background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', margin: '20px 0' }}><strong>❌ Error:</strong> {error}</div>}

            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button type="button" onClick={() => navigate('/needy')} className="btn btn-secondary" style={{ flex: 1 }} disabled={loading}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, background: loading ? '#6c757d' : '#dc3545' }}>
                {loading ? 'Creating Request...' : '🆘 Create Blood Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NeedyRequestCreatePage;
