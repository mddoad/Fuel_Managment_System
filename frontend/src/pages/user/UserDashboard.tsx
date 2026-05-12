import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

type Vehicle = {
  id: number;
  type: string;
  plateNumber: string;
  ownerName: string;
  ownerPhone: string;
};

type FuelLog = {
  id: number;
  date: string;
  liters: number;
  totalCost: number;
  station: { id: number; name: string };
  vehicle: { id: number; plateNumber: string };
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalLiters = logs.reduce((s, l) => s + (Number(l.liters) || 0), 0);
    const totalCost = logs.reduce((s, l) => s + (Number(l.totalCost) || 0), 0);
    return { totalLiters: Number(totalLiters.toFixed(2)), totalCost: Number(totalCost.toFixed(2)) };
  }, [logs]);

  function logout() {
    localStorage.removeItem('accessToken');
    navigate('/login', { replace: true });
  }

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const [vhRes, logsRes] = await Promise.all([
          api.get('/vehicles/mine'),
          api.get('/fuel-logs/mine'),
        ]);
        setVehicles(vhRes.data);
        setLogs(logsRes.data);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login', { replace: true });
          return;
        }
        setError(err?.response?.data?.message ?? 'Failed to load dashboard');
      }
    })();
  }, [navigate]);

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="badge" style={{ marginBottom: 10 }}>Fuel Management</div>
          <h1 style={{ margin: 0, fontSize: 30 }}>User Dashboard</h1>
        </div>
        <button className="btn btn-secondary" onClick={logout}>Logout</button>
      </div>

      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}

      {/* Top actions */}
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>My Vehicles</div>
          <div className="muted" style={{ marginBottom: 12 }}>
            Approved vehicles you can use for fuel.
          </div>
          <Link className="btn" to="/user/vehicles">Open</Link>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>Add Vehicle</div>
          <div className="muted" style={{ marginBottom: 12 }}>
            Apply with registration PDF. Admin must approve.
          </div>
          <Link className="btn" to="/user/vehicles/apply">Apply</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Total liters (All history)</div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{stats.totalLiters} L</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Total cost (All history)</div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{stats.totalCost}</div>
        </div>
      </div>

      {/* History */}
      <div className="card" style={{ padding: 16, marginTop: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>History (All vehicles)</div>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 170 }}>Date</th>
              <th>Vehicle</th>
              <th>Station</th>
              <th>Liters</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="muted">{new Date(l.date).toLocaleString()}</td>
                <td>{l.vehicle?.plateNumber ?? '-'}</td>
                <td>{l.station?.name ?? '-'}</td>
                <td>{l.liters}</td>
                <td>{l.totalCost}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">No history yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quick list preview */}
      <div className="card" style={{ padding: 16, marginTop: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Approved Vehicles</div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Vehicle No</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td className="muted">#{v.id}</td>
                <td className="muted">{v.type}</td>
                <td>{v.plateNumber}</td>
                <td className="muted">{v.ownerName} ({v.ownerPhone})</td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">No approved vehicles. Apply first.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}