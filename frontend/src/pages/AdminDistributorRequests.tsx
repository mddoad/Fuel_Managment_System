import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

type DistributorApplication = {
  id: number;
  ownerName: string;
  ownerPhone: string;
  stationName: string;
  stationPhone: string;
  address: string;
  email: string;
  licensePdfPath: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
};

export default function AdminDistributorRequests() {
  const [items, setItems] = useState<DistributorApplication[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await api.get('/distributors/applications/pending');
        setItems(res.data);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login', { replace: true });
          return;
        }
        setError(err?.response?.data?.message ?? 'Failed to load pending requests');
      }
    })();
  }, [navigate]);

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="badge" style={{ marginBottom: 10 }}>Admin</div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Distributor Requests</h1>
          <div className="muted" style={{ marginTop: 8 }}>Pending applications: {items.length}</div>
        </div>

        <button className="btn btn-secondary" onClick={() => navigate('/')}>Back</button>
      </div>

      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 16, marginTop: 14 }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Owner</th>
              <th>Station</th>
              <th>Email</th>
              <th>Created</th>
              <th style={{ width: 140 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td className="muted">#{a.id}</td>
                <td>
                  {a.ownerName}
                  <div className="muted" style={{ fontSize: 12 }}>{a.ownerPhone}</div>
                </td>
                <td>
                  {a.stationName}
                  <div className="muted" style={{ fontSize: 12 }}>{a.stationPhone}</div>
                </td>
                <td className="muted">{a.email}</td>
                <td className="muted">{new Date(a.createdAt).toLocaleString()}</td>
                <td>
                  <Link className="btn" to={`/admin/distributor-requests/${a.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  No pending distributor requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}