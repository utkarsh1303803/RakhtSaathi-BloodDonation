import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const NeedyLoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login, register, isAuthenticated, userType, userProfile } = useAuth();

  // Only redirect to dashboard if user has a complete profile
  useEffect(() => {
    if (isAuthenticated && userType === 'NEEDY' && userProfile) {
      navigate('/needy/dashboard');
    }
  }, [isAuthenticated, userType, userProfile, navigate]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const data = await login(formData.email, formData.password);
        if (data.userType === 'DONOR') {
          setError('You are registered as a DONOR. Please use Donor Login.');
        } else if (data.userType === 'ADMIN') {
          setError('You are registered as an ADMIN. Please use Admin Login.');
        } else if (data.userType === 'NEEDY') {
          // Direct redirect - don't wait for profile
          navigate('/needy/dashboard');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        await register(formData.email, formData.password, formData.email.split('@')[0], 'NEEDY');
        await login(formData.email, formData.password);
        // New user - no profile yet, go to register
        navigate('/needy/register');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="needy-login">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>🆘 {isLogin ? 'Needy Login' : 'Create Needy Account'}</h1>
            <p>{isLogin ? 'Login to request blood' : 'Create account to request blood'}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626', marginBottom: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626' }}>🚨 Life-Threatening Emergency</h3>
            <p style={{ color: '#dc2626', marginTop: '10px' }}>
              Emergency Helpline: <strong>📞 +91-9876543210</strong>
            </p>
          </div>
        </div>

        <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2>{isLogin ? 'Login' : 'Create Account'}</h2>

            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} minLength="6" required />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Confirm Password *</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} minLength="6" required />
              </div>
            )}

            {error && <div className="error" style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>
                {isLogin ? "Don't have an account? Create one" : "Already have an account? Login"}
              </button>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p>Want to donate blood? <a href="/donor/auth">Become a Donor</a> | <a href="/">Home</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeedyLoginPage;
