import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';

type VehicleReq = {
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

export default function AdminVehicleRequestDetails() {
  const { id } = useParams();
  const reqId = Number(id);

  const [item, setItem] = useState<VehicleReq | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const pdfUrl = useMemo(() => {
    if (!item?.registrationPdfPath) return null;
    return `http://localhost:3000/${item.registrationPdfPath}`.replace('http://localhost:3000//', 'http://localhost:3000/');
  }, [item]);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await api.get(`/vehicles/${reqId}`);
        setItem(res.data);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login', { replace: true });
          return;
        }
        setError(err?.response?.data?.message ?? 'Failed to load request');
      }
    })();
  }, [reqId, navigate]);

  async function approve() {
    if (!item) return;
    setLoading(true);
    setError(null);
    try {
      await api.post(`/vehicles/${item.id}/approve`);
      navigate('/admin/vehicle-requests', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Approve failed');
    } finally {
      setLoading(false);
    }
  }

  async function reject() {
    if (!item) return;
    setLoading(true);
    setError(null);
    try {
      await api.post(`/vehicles/${item.id}/reject`);
      navigate('/admin/vehicle-requests', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Reject failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="badge" style={{ marginBottom: 10 }}>Admin</div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Vehicle Request #{reqId}</h1>
          {item && <div className="muted" style={{ marginTop: 8 }}>Status: <span className="badge">{item.status}</span></div>}
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/vehicle-requests')}>Back</button>
      </div>

      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}

      {item && (
        <div className="grid grid-2" style={{ marginTop: 14 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Information</div>
            <div className="muted" style={{ lineHeight: 1.8 }}>
              <div><b style={{ color: 'white' }}>Vehicle:</b> {item.plateNumber}</div>
              <div><b style={{ color: 'white' }}>Type:</b> {item.type}</div>
              <div><b style={{ color: 'white' }}>Owner:</b> {item.ownerName} ({item.ownerPhone})</div>
              <div><b style={{ color: 'white' }}>UserId:</b> {item.userId}</div>
              <div><b style={{ color: 'white' }}>Created:</b> {new Date(item.createdAt).toLocaleString()}</div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="btn" onClick={approve} disabled={loading || item.status !== 'PENDING'}>
                {loading ? 'Processing...' : 'Approve'}
              </button>
              <button className="btn btn-secondary" onClick={reject} disabled={loading || item.status !== 'PENDING'}>
                Reject
              </button>
              {pdfUrl && (
                <a className="btn btn-secondary" href={pdfUrl} target="_blank" rel="noreferrer">
                  Open PDF
                </a>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Registration PDF</div>
            {!pdfUrl && <div className="muted">No PDF found.</div>}
            {pdfUrl && (
              <iframe
                title="Registration PDF"
                src={pdfUrl}
                style={{ width: '100%', height: 520, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}