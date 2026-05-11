import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ marginTop: 0 }}>Forgot password</h2>
        <p className="muted">
          This is a placeholder page. Next we will implement password reset flow (send code/email, verify, set new password).
        </p>

        <button className="btn btn-secondary" onClick={() => navigate('/login')}>
          Back to login
        </button>
      </div>
    </div>
  );
}