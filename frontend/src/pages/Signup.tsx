import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '28px 0' }}>
      <div className="card" style={{ width: 'min(820px, 100%)', padding: 20 }}>
        <div className="badge" style={{ marginBottom: 12 }}>Sign up</div>
        <h1 style={{ margin: '0 0 10px 0' }}>Choose account type</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Select how you want to register in the Fuel Management System.
        </p>

        <div className="grid grid-2" style={{ marginTop: 16 }}>
          <button className="btn" onClick={() => navigate('/signup/user')} style={{ padding: 16 }}>
            Sign up as User
            <div className="muted" style={{ fontSize: 12, marginTop: 6, fontWeight: 500 }}>
              Can login immediately after registration
            </div>
          </button>

          <button className="btn btn-secondary" onClick={() => navigate('/signup/distributor')} style={{ padding: 16 }}>
            Sign up as Distributor
            <div className="muted" style={{ fontSize: 12, marginTop: 6, fontWeight: 500 }}>
              Requires admin approval before you can login
            </div>
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}