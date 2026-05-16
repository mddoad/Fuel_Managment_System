import { Link, useNavigate } from 'react-router-dom';

export default function DistributorDashboard() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('accessToken');
    navigate('/login');
  }

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div>
          <div className="badge">Distributor</div>
          <h2 style={{ margin: '10px 0 0' }}>Distributor Dashboard</h2>
          <p className="muted" style={{ margin: 0 }}>Manage requests and view your station information</p>
        </div>

        <button className="btn btn-secondary" onClick={logout}>Logout</button>
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>My Information</div>
          <div className="muted" style={{ marginBottom: 12 }}>
            View your owner + filling station details and license PDF.
          </div>
          <Link className="btn" to="/distributor/me">Open</Link>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>Fuel Requests</div>
          <div className="muted" style={{ marginBottom: 12 }}>
            View pending requests sent to your station.
          </div>
          <Link className="btn" to="/distributor/requests">Open</Link>
        </div>
      </div>
    </div>
  );
}