import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donorApi, feedbackApi } from '../../services/api';

const DonorProfilePage = () => {
  const { userProfile, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    feedbackApi.getMyFeedback()
      .then(data => setFeedbacks(data || []))
      .catch(() => {});
    feedbackApi.getMyAverage()
      .then(avg => setAvgRating(avg || 0))
      .catch(() => {});
  }, []);

  const handleEdit = () => { setEditData({ ...userProfile }); setIsEditing(true); };
  const handleCancel = () => { setEditData({}); setIsEditing(false); setError(''); };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const updated = await donorApi.updateProfile({
        bloodGroup: editData.bloodGroup,
        city: editData.city,
        district: editData.district,
        phone: editData.phone || editData.contactNumber || '',
        age: parseInt(editData.age),
        weight: parseFloat(editData.weight),
        gender: editData.gender,
        isAvailable: editData.isAvailable
      });
      updateUserProfile({ ...updated, userType: 'DONOR' }, 'DONOR');
      setIsEditing(false);
      setSuccess('✅ Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const calculateNextEligibleDate = () => {
    if (!userProfile?.lastDonationDate) return 'Eligible now';
    const last = new Date(userProfile.lastDonationDate);
    const next = new Date(last);
    next.setDate(next.getDate() + 90);
    return next <= new Date() ? 'Eligible now' : next.toLocaleDateString();
  };

  if (!userProfile) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Profile Not Found</h2>
      <p>Please complete your donor registration.</p>
      <Link to="/donor/register" className="btn btn-primary">Complete Registration</Link>
    </div>
  );

  return (
    <div className="donor-profile">
      <div className="header"><h1>👤 Donor Profile</h1><p>Manage your donor information</p></div>

      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2>{userProfile.fullName || userProfile.name}</h2>
              <p style={{ color: '#6b7280' }}>User ID: {userProfile.id || userProfile.userId}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {!isEditing ? (
                <button onClick={handleEdit} className="btn btn-secondary">✏️ Edit Profile</button>
              ) : (
                <>
                  <button onClick={handleSave} className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : '💾 Save'}</button>
                  <button onClick={handleCancel} className="btn btn-secondary">❌ Cancel</button>
                </>
              )}
              <button onClick={logout} className="btn btn-secondary">🚪 Logout</button>
            </div>
          </div>

          {success && <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}
          {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Blood Group', value: userProfile.bloodGroup?.replace('_', ''), color: '#dc2626', bg: '#fef2f2' },
              { label: 'Total Donations', value: userProfile.donationCount || 0, color: '#059669', bg: '#f0fdf4' },
              { label: 'Rating', value: userProfile.rating ? userProfile.rating.toFixed(1) : 'N/A', color: '#f59e0b', bg: '#fef3c7' },
              { label: 'Feedback Count', value: userProfile.totalFeedbackCount || 0, color: '#0369a1', bg: '#e0f2fe' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '15px', backgroundColor: s.bg, borderRadius: '8px' }}>
                <h3 style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Personal Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div>
              <label><strong>Full Name:</strong></label>
              <p>{userProfile.fullName || userProfile.name}</p>
            </div>
            <div>
              <label><strong>Email:</strong></label>
              <p>{userProfile.email}</p>
              <small style={{ color: '#6b7280' }}>Email cannot be changed</small>
            </div>
            <div>
              <label><strong>Aadhaar:</strong></label>
              <p>{userProfile.aadhaarNumber || '****-****-****'}</p>
            </div>
            <div>
              <label><strong>Gender:</strong></label>
              {isEditing ? (
                <select value={editData.gender || ''} onChange={e => setEditData({ ...editData, gender: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                  <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                </select>
              ) : <p>{userProfile.gender}</p>}
            </div>
            <div>
              <label><strong>Age:</strong></label>
              {isEditing ? (
                <input type="number" value={editData.age || ''} onChange={e => setEditData({ ...editData, age: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              ) : <p>{userProfile.age} years</p>}
            </div>
            <div>
              <label><strong>Weight:</strong></label>
              {isEditing ? (
                <input type="number" value={editData.weight || ''} onChange={e => setEditData({ ...editData, weight: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              ) : <p>{userProfile.weight} kg</p>}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Location Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div>
              <label><strong>City:</strong></label>
              {isEditing ? (
                <input type="text" value={editData.city || ''} onChange={e => setEditData({ ...editData, city: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              ) : <p>{userProfile.city}</p>}
            </div>
            <div>
              <label><strong>District:</strong></label>
              {isEditing ? (
                <input type="text" value={editData.district || ''} onChange={e => setEditData({ ...editData, district: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              ) : <p>{userProfile.district}</p>}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Medical Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div>
              <label><strong>Blood Group:</strong></label>
              <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '1.2rem' }}>{userProfile.bloodGroup?.replace('_', '')}</p>
              <small style={{ color: '#6b7280' }}>Blood group cannot be changed</small>
            </div>
            <div>
              <label><strong>Last Donation:</strong></label>
              <p>{userProfile.lastDonationDate ? new Date(userProfile.lastDonationDate).toLocaleDateString() : 'Never'}</p>
            </div>
            <div>
              <label><strong>Next Eligible Date:</strong></label>
              <p style={{ color: calculateNextEligibleDate() === 'Eligible now' ? '#059669' : '#f59e0b', fontWeight: 'bold' }}>{calculateNextEligibleDate()}</p>
            </div>
            <div>
              <label><strong>Account Status:</strong></label>
              {isEditing ? (
                <select value={editData.isAvailable ? 'true' : 'false'} onChange={e => setEditData({ ...editData, isAvailable: e.target.value === 'true' })} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                  <option value="true">✅ Available</option>
                  <option value="false">❌ Unavailable</option>
                </select>
              ) : (
                <p style={{ color: userProfile.isAvailable ? '#059669' : '#dc2626', fontWeight: 'bold' }}>
                  {userProfile.isAvailable ? '✅ Available' : '❌ Unavailable'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>⭐ Feedback Received from Patients</h3>
          {feedbacks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
              <p style={{ fontSize: '2rem' }}>⭐</p>
              <p>No feedback received yet. Complete donations to receive ratings from patients.</p>
            </div>
          ) : (
            <div>
              {/* Average Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {avgRating.toFixed(1)}
                </div>
                <div>
                  <div style={{ fontSize: '20px' }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ color: s <= Math.round(avgRating) ? '#f59e0b' : '#d1d5db' }}>★</span>
                    ))}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>
                    Average rating from {feedbacks.length} patient{feedbacks.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Individual Feedbacks */}
              {feedbacks.map(fb => (
                <div key={fb.id} style={{ padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '12px', backgroundColor: '#f9fafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= fb.rating ? '#f59e0b' : '#d1d5db', fontSize: '18px' }}>★</span>
                      ))}
                      <span style={{ marginLeft: '8px', fontWeight: 'bold', color: '#374151' }}>{fb.rating}/5</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString('en-IN') : ''}
                    </span>
                  </div>
                  {fb.comment && (
                    <p style={{ margin: '0 0 8px 0', color: '#374151', fontStyle: 'italic' }}>
                      "{fb.comment}"
                    </p>
                  )}
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {fb.patientName && <span>Patient: <strong>{fb.patientName}</strong></span>}
                    {fb.hospital && <span style={{ marginLeft: '10px' }}>🏥 {fb.hospital}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <Link to="/donor/dashboard" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>🏠 Dashboard</Link>
            <Link to="/donor/history" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>📋 Donation History</Link>
            <Link to="/donor/health-checklist" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>🏥 Health Checklist</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorProfilePage;
