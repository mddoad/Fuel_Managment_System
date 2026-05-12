import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export default function AdminDistributorRequestDetails() {
  const { id } = useParams();
  const appId = Number(id);

  const [item, setItem] = useState<DistributorApplication | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const licenseUrl = useMemo(() => {
    if (!item?.licensePdfPath) return null;
    // item.licensePdfPath looks like "uploads/licenses/xxx.pdf"
    return `http://localhost:3000/${item.licensePdfPath}`.replace('http://localhost:3000//', 'http://localhost:3000/');
  }, [item]);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await api.get(`/distributors/applications/${appId}`);
        setItem(res.data);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login', { replace: true });
          return;
        }
        setError(err?.response?.data?.message ?? 'Failed to load application');
      }
    })();
  }, [appId, navigate]);

  async function approve() {
    if (!item) return;
    setLoading(true);
    setError(null);
    try {
      await api.post(`/distributors/applications/${item.id}/approve`);
      navigate('/admin/distributor-requests', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Approve failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="badge" style={{ marginBottom: 10 }}>Admin</div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Distributor Request #{appId}</h1>
          {item && <div className="muted" style={{ marginTop: 8 }}>Status: <span className="badge">{item.status}</span></div>}
        </div>

        <button className="btn btn-secondary" onClick={() => navigate('/admin/distributor-requests')}>
          Back
        </button>
      </div>

      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}

      {item && (
        <div className="grid grid-2" style={{ marginTop: 14 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Information</div>
            <div className="muted" style={{ fontSize: 13, lineHeight: 1.8 }}>
              <div><b style={{ color: 'white' }}>Owner:</b> {item.ownerName} ({item.ownerPhone})</div>
              <div><b style={{ color: 'white' }}>Station:</b> {item.stationName} ({item.stationPhone})</div>
              <div><b style={{ color: 'white' }}>Email:</b> {item.email}</div>
              <div><b style={{ color: 'white' }}>Address:</b> {item.address}</div>
              <div><b style={{ color: 'white' }}>Created:</b> {new Date(item.createdAt).toLocaleString()}</div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="btn" onClick={approve} disabled={loading || item.status !== 'PENDING'}>
                {loading ? 'Approving...' : 'Approve'}
              </button>

              {licenseUrl && (
                <a className="btn btn-secondary" href={licenseUrl} target="_blank" rel="noreferrer">
                  Open PDF
                </a>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>License PDF</div>

            {!licenseUrl && <div className="muted">No license PDF path found.</div>}

            {licenseUrl && (
              <iframe
                title="License PDF"
                src={licenseUrl}
                style={{ width: '100%', height: 520, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}