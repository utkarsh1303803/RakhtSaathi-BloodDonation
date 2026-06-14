import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login, isAuthenticated, userType } = useAuth();

  useEffect(() => {
    if (isAuthenticated && userType === 'ADMIN') navigate('/admin/dashboard');
  }, [isAuthenticated, userType, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      if (data.userType === 'ADMIN') {
        // Direct navigate - don't rely on useEffect
        window.location.href = '/admin/dashboard';
      } else {
        setError(`Access denied. This account is registered as ${data.userType}. Admin access only.`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      if (msg.includes('Bad credentials') || msg.includes('Invalid')) {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div><h1>⚙️ Admin Login</h1><p>Administrative access to RakhtSaathi platform</p></div>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <form onSubmit={handleLogin}>
            <h2>Administrator Access</h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Sign in to access the admin dashboard and manage the platform.</p>

            <div className="form-group">
              <label>Admin Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter admin email" required />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
            </div>

            {error && <div className="error" style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginBottom: '15px', marginTop: '10px' }}>
              {loading ? 'Signing In...' : '⚙️ Admin Login'}
            </button>
          </form>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', border: '1px solid #0066cc', borderRadius: '5px' }}>
            <h4 style={{ color: '#0066cc', margin: '0 0 10px 0' }}>🔧 First Time Setup</h4>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#0066cc' }}>
              Don't have an admin account? Create one:
            </p>
            <button
              type="button"
              onClick={async () => {
                if (!email || !password) { alert('Please enter email and password first'); return; }
                try {
                  const { authApi } = await import('../../services/api');
                  await authApi.register(email, password, 'System Administrator', 'ADMIN');
                  alert('✅ Admin account created! Now click Login.');
                } catch (err) {
                  alert('Error: ' + (err.response?.data?.message || err.message));
                }
              }}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '13px' }}
            >
              Create Admin Account
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p><Link to="/">← Back to Home</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
