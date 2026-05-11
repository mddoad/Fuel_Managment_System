import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

type Me = { id: number; email?: string; phone?: string; role: 'ADMIN' | 'USER' };
type Station = { id: number; name: string; address?: string };
type Vehicle = { id: number; plateNumber: string; type?: string };
type FuelLog = { id: number; liters: number; totalCost: number; date: string };

export default function Dashboard() {
  const [me, setMe] = useState<Me | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [myLogs, setMyLogs] = useState<FuelLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

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
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>

      {me && (
        <p>
          Logged in as: <b>{me.email ?? me.phone ?? 'Unknown'}</b> | Role: <b>{me.role}</b>
        </p>
      )}

      <p>
        <Link to="/fuel-logs/new">Create Fuel Log</Link>
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>Stations</h3>
      <ul>
        {stations.map((s) => (
          <li key={s.id}>
            #{s.id} {s.name} {s.address ? `- ${s.address}` : ''}
          </li>
        ))}
      </ul>

      <h3>Vehicles</h3>
      <ul>
        {vehicles.map((v) => (
          <li key={v.id}>
            #{v.id} {v.plateNumber} {v.type ? `- ${v.type}` : ''}
          </li>
        ))}
      </ul>

      <h3>My Fuel Logs</h3>
      <ul>
        {myLogs.map((l) => (
          <li key={l.id}>
            #{l.id} {new Date(l.date).toLocaleString()} — liters: {l.liters} — total: {l.totalCost}
          </li>
        ))}
      </ul>
    </div>
  );
}