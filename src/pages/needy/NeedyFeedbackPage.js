import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { feedbackApi } from '../../services/api';

const NeedyFeedbackPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState({ rating: 5, text: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await feedbackApi.submit(parseInt(requestId), feedback.rating, feedback.text);
      navigate('/needy/request/complete');
    } catch (err) {
      setError('Failed to submit: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="needy-feedback">
      <div className="header"><h1>⭐ Donor Feedback</h1><p>Rate your experience with the blood donor</p></div>
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Rating (1-5 stars)</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => setFeedback({ ...feedback, rating: star })}
                    style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: star <= feedback.rating ? '#f59e0b' : '#d1d5db' }}>
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Feedback Comments</label>
              <textarea value={feedback.text} onChange={e => setFeedback({ ...feedback, text: e.target.value })} rows="4" placeholder="Share your experience with the donor..." />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NeedyFeedbackPage;
