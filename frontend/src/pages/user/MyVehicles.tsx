import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

type Vehicle = { id: number; type: string; plateNumber: string; ownerName: string; ownerPhone: string };

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await api.get('/vehicles/mine');
        setVehicles(res.data);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login', { replace: true });
          return;
        }
        setError(err?.response?.data?.message ?? 'Failed to load vehicles');
      }
    })();
  }, [navigate]);

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="badge" style={{ marginBottom: 10 }}>User</div>
          <h1 style={{ margin: 0, fontSize: 26 }}>My Vehicles</h1>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Back</button>
      </div>

      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 16, marginTop: 14 }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Vehicle No</th>
              <th>Owner</th>
              <th style={{ width: 150 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td className="muted">#{v.id}</td>
                <td className="muted">{v.type}</td>
                <td>{v.plateNumber}</td>
                <td className="muted">{v.ownerName} ({v.ownerPhone})</td>
                <td>
                  {/* next phase: create fuel request for vehicle */}
                  <Link className="btn" to={`/user/vehicles/${v.id}/fuel`}>Take Fuel</Link>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">No approved vehicles yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="muted" style={{ marginTop: 10 }}>
        If you applied and it is not approved yet, wait for admin approval.
      </div>
    </div>
  );
}