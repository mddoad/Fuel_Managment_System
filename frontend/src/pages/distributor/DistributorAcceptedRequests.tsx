import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

type FuelRequest = {
  id: number;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED';
  fuelType: 'OCTANE' | 'DIESEL' | 'CNG';
  amount: number;
  totalCost: number;
  createdAt: string;
  user: { id: number; fullName: string; phone: string; email: string };
  vehicle: { id: number; plateNumber: string; type: string };
  station: { id: number; name: string };
  acceptedBy?: { id: number; fullName: string } | null;
};

export default function DistributorAcceptedRequests() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FuelRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function load() {
    const res = await api.get('/fuel-requests/accepted');
    setItems(res.data);
  }

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        await load();
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login', { replace: true });
          return;
        }
        setError(err?.response?.data?.message ?? 'Failed to load accepted requests');
      }
    })();
  }, [navigate]);

  async function complete(id: number) {
    setLoadingId(id);
    try {
      await api.post(`/fuel-requests/${id}/complete`);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Complete failed');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="badge" style={{ marginBottom: 10 }}>Distributor</div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Accepted Requests</h1>
          <div className="muted" style={{ marginTop: 8 }}>Accepted: {items.length}</div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/distributor/requests')}>Pending</button>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>Back</button>
        </div>
      </div>

      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 16, marginTop: 14 }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Vehicle</th>
              <th>Station</th>
              <th>Fuel</th>
              <th>Total</th>
              <th style={{ width: 200 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td className="muted">#{r.id}</td>
                <td>
                  {r.user?.fullName ?? 'User'}
                  <div className="muted" style={{ fontSize: 12 }}>{r.user?.phone}</div>
                </td>
                <td>{r.vehicle?.plateNumber}</td>
                <td>{r.station?.name}</td>
                <td className="muted">{r.fuelType} • {r.amount}</td>
                <td>{r.totalCost}</td>
                <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn" disabled={loadingId === r.id} onClick={() => complete(r.id)}>
                    {loadingId === r.id ? 'Completing...' : 'Complete'}
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">No accepted requests.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}