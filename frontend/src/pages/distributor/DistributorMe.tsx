import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

type Profile = {
  id: number;
  userId: number;
  stationId: number | null;
  ownerName: string;
  ownerPhone: string;
  stationName: string;
  stationPhone: string;
  address: string;
  licensePdfPath: string | null;
  createdAt: string;
};

export default function DistributorMe() {
  const navigate = useNavigate();
  const [data, setData] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const licenseUrl = useMemo(() => {
    if (!data?.licensePdfPath) return null;

    // If your backend serves static /uploads, and licensePdfPath looks like "uploads/licenses/xxx.pdf"
    // then full URL is:
    return `http://localhost:3000/${data.licensePdfPath}`;
  }, [data?.licensePdfPath]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/distributors/me');
        setData(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? 'Failed to load distributor info');
      }
    })();
  }, []);

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div className="card" style={{ padding: 18 }}>
        <div className="badge" style={{ marginBottom: 10 }}>Distributor</div>
        <h2 style={{ marginTop: 0 }}>My Information</h2>

        {error && <div className="error">{error}</div>}

        {!data && !error && <div className="muted">Loading...</div>}

        {data && (
          <div className="grid" style={{ gap: 12 }}>
            <div className="card" style={{ padding: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Owner</div>
              <div><b>Name:</b> {data.ownerName}</div>
              <div><b>Phone:</b> {data.ownerPhone}</div>
            </div>

            <div className="card" style={{ padding: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Filling Station</div>
              <div><b>Name:</b> {data.stationName}</div>
              <div><b>Phone:</b> {data.stationPhone}</div>
              <div><b>Address:</b> {data.address}</div>
              <div><b>Station ID:</b> {data.stationId ?? 'N/A'}</div>
            </div>

            <div className="card" style={{ padding: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>License PDF</div>

              {!licenseUrl && <div className="muted">No license PDF uploaded.</div>}

              {licenseUrl && (
                <>
                  <a className="btn" href={licenseUrl} target="_blank" rel="noreferrer">
                    Open PDF
                  </a>

                  <div style={{ height: 12 }} />

                  <iframe
                    title="License PDF"
                    src={licenseUrl}
                    style={{ width: '100%', height: 520, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12 }}
                  />
                </>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>(Back)</button>
        </div>
      </div>
    </div>
  );
}