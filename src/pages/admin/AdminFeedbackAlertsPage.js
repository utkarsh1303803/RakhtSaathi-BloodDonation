import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';

const AdminFeedbackAlertsPage = () => {
  const [allFeedback, setAllFeedback] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminApi.getFeedback(0, 50);
        const feedback = data.content || [];
        setAllFeedback(feedback);
        // Filter suspicious feedback (rating <= 2 or contains scam/fraud keywords)
        const suspicious = feedback.filter(f =>
          f.rating <= 2 ||
          (f.text && (f.text.toLowerCase().includes('scam') || f.text.toLowerCase().includes('fraud')))
        );
        setAlerts(suspicious);
      } catch (err) {
        console.error('Error fetching feedback:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleMarkSafe = (feedbackId) => {
    setAlerts(prev => prev.filter(a => a.id !== feedbackId));
  };

  if (loading) return <div className="loading">Loading feedback alerts...</div>;

  return (
    <div className="admin-feedback-alerts">
      <div className="header">
        <h1>🛡️ Scam & Fraud Alerts</h1>
        <p>AI-flagged suspicious feedback for review</p>
      </div>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {[
            { label: 'Total Feedback', value: allFeedback.length, color: '#0369a1', bg: '#e0f2fe' },
            { label: 'Flagged Alerts', value: alerts.length, color: '#dc2626', bg: '#fef2f2' },
            { label: 'Low Ratings (≤2)', value: allFeedback.filter(f => f.rating <= 2).length, color: '#f59e0b', bg: '#fef3c7' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', backgroundColor: s.bg }}>
              <h3 style={{ color: s.color, fontSize: '2rem', margin: '0' }}>{s.value}</h3>
              <p style={{ margin: '5px 0 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>Flagged Feedback ({alerts.length})</h2>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No suspicious feedback detected. Great job!</p>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              {alerts.map(alert => (
                <div key={alert.id} className="card" style={{ marginBottom: '20px', border: '1px solid #fecaca', backgroundColor: '#fef2f2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#dc2626' }}>⚠️ Suspicious Feedback Detected</h4>
                      <div style={{ marginTop: '15px' }}>
                        <p><strong>Feedback Text:</strong></p>
                        <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb', marginTop: '5px' }}>
                          "{alert.text || alert.comment}"
                        </div>
                      </div>
                      <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                        <div><strong>Rating:</strong> {alert.rating}/5</div>
                        <div><strong>Donor:</strong> {alert.donorName || 'N/A'}</div>
                        <div><strong>Requestor:</strong> {alert.needyName || 'N/A'}</div>
                        <div><strong>Date:</strong> {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>
                    <div style={{ marginLeft: '20px' }}>
                      <button onClick={() => handleMarkSafe(alert.id)} className="btn btn-primary" style={{ marginBottom: '10px', width: '120px' }}>Mark Safe</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Feedback */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h2>All Feedback ({allFeedback.length})</h2>
          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  {['Rating', 'Comment', 'Donor', 'Needy', 'Date'].map(h => (
                    <th key={h} style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeedback.map(fb => (
                  <tr key={fb.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{ color: fb.rating >= 4 ? '#059669' : fb.rating >= 3 ? '#f59e0b' : '#dc2626', fontWeight: 'bold' }}>
                        {'⭐'.repeat(fb.rating)} ({fb.rating}/5)
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{fb.text || fb.comment || 'No comment'}</td>
                    <td style={{ padding: '12px' }}>{fb.donorName || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{fb.needyName || 'N/A'}</td>
                    <td style={{ padding: '12px' }}><small>{fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : 'N/A'}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackAlertsPage;
