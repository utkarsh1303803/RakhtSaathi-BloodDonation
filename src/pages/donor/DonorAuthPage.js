import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const DonorAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login, register, isAuthenticated, userType, userProfile } = useAuth();

  useEffect(() => {
    if (isAuthenticated && userType === 'DONOR' && userProfile) {
      navigate('/donor/dashboard');
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
        if (data.userType === 'DONOR') navigate('/donor/dashboard');
        else navigate('/donor/register');
      } else {
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
        await register(formData.email, formData.password, formData.email.split('@')[0], 'DONOR');
        await login(formData.email, formData.password);
        navigate('/donor/register');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donor-auth">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div><h1>🩸 {isLogin ? 'Donor Login' : 'Create Donor Account'}</h1></div>
          <LanguageSwitcher />
        </div>
      </div>
      <div className="container">
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2>{isLogin ? 'Welcome Back!' : 'Join as Donor'}</h2>
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
              {loading ? 'Processing...' : (isLogin ? '🩸 Sign In' : 'Create Account')}
            </button>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>
                {isLogin ? "Don't have an account? Create one" : "Already have an account? Login"}
              </button>
            </div>
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p>Need blood? <a href="/needy/login">Request Blood</a> | <a href="/">Home</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorAuthPage;
