import { useNavigate } from 'react-router-dom';

export default function DistributorSignup() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ marginTop: 0 }}>Distributor Sign up</h2>
        <p className="muted">Next step: add full form + PDF upload + call backend endpoint.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/signup')}>Back</button>
      </div>
    </div>
  );
}