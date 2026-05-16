import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

type Me = { id: number; email?: string; phone?: string; role: 'ADMIN' | 'USER' | 'DISTRIBUTOR' };
type Station = { id: number; name: string; address?: string };
type Vehicle = { id: number; plateNumber: string; type?: string };
type FuelLog = { id: number; liters: number; totalCost: number; date: string };

function CardTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontWeight: 800, marginBottom: 10 }}>{children}</div>;
}

export default function Dashboard() {
  const [me, setMe] = useState<Me | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [myLogs, setMyLogs] = useState<FuelLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalLiters = myLogs.reduce((sum, l) => sum + (Number(l.liters) || 0), 0);
    const totalCost = myLogs.reduce((sum, l) => sum + (Number(l.totalCost) || 0), 0);
    return {
      totalLiters: Number(totalLiters.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
    };
  }, [myLogs]);

  function logout() {
    localStorage.removeItem('accessToken');
    navigate('/login', { replace: true });
  }

  useEffect(() => {
    (async () => {
      try {
        setError(null);

        const [meRes, stRes, vhRes, logsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/stations'),
          api.get('/vehicles'),
          api.get('/fuel-logs/mine'),
        ]);

        setMe(meRes.data);
        setStations(stRes.data);
        setVehicles(vhRes.data);
        setMyLogs(logsRes.data);
      } catch (err: any) {
        const status = err?.response?.status;

        if (status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login', { replace: true });
          return;
        }

        setError(err?.response?.data?.message ?? 'Failed to load dashboard data');
      }
    })();
  }, [navigate]);

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="badge" style={{ marginBottom: 10 }}>Fuel Management</div>
          <h1 style={{ margin: 0, fontSize: 30 }}>Dashboard</h1>
          {me && (
            <div className="muted" style={{ marginTop: 8 }}>
              Logged in as <b style={{ color: 'white' }}>{me.email ?? me.phone ?? 'Unknown'}</b> • Role{' '}
              <span className="badge" style={{ marginLeft: 6 }}>
                {me.role}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link className="btn" to="/fuel-logs/new" style={{ display: 'inline-flex', alignItems: 'center' }}>
            + Create Fuel Log
          </Link>
          <button className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}

      {/* Stats */}
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <CardTitle>Total liters (My logs)</CardTitle>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{stats.totalLiters} L</div>
          <div className="muted" style={{ marginTop: 8 }}>
            Based on <b>{myLogs.length}</b> logs
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <CardTitle>Total cost (My logs)</CardTitle>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{stats.totalCost}</div>
          <div className="muted" style={{ marginTop: 8 }}>
            Sum of your recorded logs
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card" style={{ padding: 16 }}>
          <CardTitle>Stations</CardTitle>
          <div className="muted" style={{ marginBottom: 10 }}>
            USER can view only. ADMIN manages.
          </div>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Name</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.id}>
                  <td className="muted">#{s.id}</td>
                  <td>{s.name}</td>
                  <td className="muted">{s.address ?? '-'}</td>
                </tr>
              ))}
              {stations.length === 0 && (
                <tr>
                  <td colSpan={3} className="muted">
                    No stations found. (Create stations as ADMIN.)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <CardTitle>Vehicles</CardTitle>
          <div className="muted" style={{ marginBottom: 10 }}>
            USER can view only. ADMIN manages.
          </div>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Plate</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td className="muted">#{v.id}</td>
                  <td>{v.plateNumber}</td>
                  <td className="muted">{v.type ?? '-'}</td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={3} className="muted">
                    No vehicles found. (Create vehicles as ADMIN.)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fuel logs */}
      <div className="card" style={{ padding: 16, marginTop: 14 }}>
        <CardTitle>My Fuel Logs</CardTitle>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>ID</th>
              <th style={{ width: 220 }}>Date</th>
              <th>Liters</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {myLogs.map((l) => (
              <tr key={l.id}>
                <td className="muted">#{l.id}</td>
                <td className="muted">{new Date(l.date).toLocaleString()}</td>
                <td>{l.liters}</td>
                <td>{l.totalCost}</td>
              </tr>
            ))}
            {myLogs.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No fuel logs yet. Click <b>+ Create Fuel Log</b>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}