import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

type VehicleRequest = {
  id: number;
  userId: number;
  type: string;
  plateNumber: string;
  ownerName: string;
  ownerPhone: string;
  registrationPdfPath: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
};

export default function AdminVehicleRequests() {
  const [items, setItems] = useState<VehicleRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await api.get('/vehicles/pending');
        setItems(res.data);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login', { replace: true });
          return;
        }
        setError(err?.response?.data?.message ?? 'Failed to load pending vehicle requests');
      }
    })();
  }, [navigate]);

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="badge" style={{ marginBottom: 10 }}>Admin</div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Vehicle Requests</h1>
          <div className="muted" style={{ marginTop: 8 }}>Pending: {items.length}</div>
        </div>

        <button className="btn btn-secondary" onClick={() => navigate('/')}>Back</button>
      </div>

      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 16, marginTop: 14 }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehicle</th>
              <th>Owner</th>
              <th>UserId</th>
              <th>Created</th>
              <th style={{ width: 140 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v.id}>
                <td className="muted">#{v.id}</td>
                <td>
                  {v.plateNumber}
                  <div className="muted" style={{ fontSize: 12 }}>{v.type}</div>
                </td>
                <td>
                  {v.ownerName}
                  <div className="muted" style={{ fontSize: 12 }}>{v.ownerPhone}</div>
                </td>
                <td className="muted">{v.userId}</td>
                <td className="muted">{new Date(v.createdAt).toLocaleString()}</td>
                <td>
                  <Link className="btn" to={`/admin/vehicle-requests/${v.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">No pending vehicle requests.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}