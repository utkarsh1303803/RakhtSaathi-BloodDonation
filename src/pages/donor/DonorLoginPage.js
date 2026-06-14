import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const DonorLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login, isAuthenticated, userType, userProfile } = useAuth();

  useEffect(() => {
    if (isAuthenticated && userType === 'DONOR' && userProfile) {
      navigate('/donor/dashboard');
    }
  }, [isAuthenticated, userType, userProfile, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      if (data.userType === 'NEEDY') {
        setError('You are registered as NEEDY. Please use Needy Login.');
      } else if (data.userType === 'ADMIN') {
        setError('You are registered as ADMIN. Please use Admin Login.');
      } else if (data.userType === 'DONOR') {
        // Direct redirect - don't wait for profile
        navigate('/donor/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donor-login">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div><h1>🩸 Donor Login</h1><p>Sign in to your donor account</p></div>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <form onSubmit={handleLogin}>
            <h2>Welcome Back!</h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Sign in to access your donor dashboard and view blood requests.</p>

            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
            </div>

            {error && <div className="error" style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginBottom: '15px', marginTop: '10px' }}>
              {loading ? 'Signing In...' : '🩸 Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p>Don't have an account? <a href="/donor/auth">Register here</a></p>
            <p><a href="/">← Back to Home</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorLoginPage;
