import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useNavigate } from 'react-router-dom';

type Request = {
  id: number;
  user: { id: number; fullName?: string; phone?: string; email?: string };
  vehicle: { id: number; plateNumber: string; type: string };
  station: { id: number; name: string };
  fuelType: string;
  amount: number;
  totalCost: number;
  status: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
};

type Me = {
  id: number;
  email?: string;
  phone?: string;
  fullName?: string;
  role: string;
};

export default function DistributorDashboard() {
  // Tabs: "pending", "accepted"
  const [tab, setTab] = useState<'pending' | 'accepted'>('pending');
  const [pending, setPending] = useState<Request[]>([]);
  const [accepted, setAccepted] = useState<Request[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function load() {
    setLoading(true); setError(null);
    try {
      const [meRes, pRes, aRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/fuel-requests/pending'),
        api.get('/fuel-requests/accepted'),
      ]);
      setMe(meRes.data);
      setPending(pRes.data);
      setAccepted(aRes.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function accept(id: number) {
    setActionId(id); setError(null);
    try {
      await api.post(`/fuel-requests/${id}/accept`);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error accepting request');
    } finally {
      setActionId(null);
    }
  }

  async function complete(id: number) {
    setActionId(id); setError(null);
    try {
      await api.post(`/fuel-requests/${id}/complete`);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error completing request');
    } finally {
      setActionId(null);
    }
  }

  function fmt(d?: string) { return d ? new Date(d).toLocaleString() : ''; }

  function userLabel(u?: Request["user"]) {
    return u?.fullName || u?.email || u?.phone || `User ${u?.id}`;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--app-bg, #181c24)', padding: 0 }}>
      {/* Header */}
      <div
        style={{
          background: '#1e2632',
          color: '#FFF',
          padding: '28px 0 12px 0',
          borderBottom: '1px solid #222',
          marginBottom: 0,
        }}>
        <div className="container" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div>
            <div className="badge" style={{ fontSize: 14, marginBottom: 10 }}>Distributor Dashboard</div>
            <h1 style={{ margin: 0, fontSize: 28 }}>
              Welcome{me?.fullName ? `, ${me.fullName}` : ''}!
            </h1>
            {me && (
              <div className="muted" style={{marginTop: 8}}>
                Account: <b style={{color:'#fff'}}>{me.email || me.phone}</b> &nbsp;•&nbsp; <span className="badge">DISTRIBUTOR</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Back</button>
            <button className="btn" onClick={() => { localStorage.removeItem('accessToken'); navigate('/login', { replace: true }) }}>Logout</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container" style={{marginTop: 24}}>
        <div style={{display:'flex', gap: 10, marginBottom: 24}}>
          <button
            className={`btn ${tab==='pending'?'':'btn-secondary'}`}
            onClick={() => setTab('pending')}
          >
            Pending Requests <span className="badge" style={{marginLeft:6}}>{pending.length}</span>
          </button>
          <button
            className={`btn ${tab==='accepted'?'':'btn-secondary'}`}
            onClick={() => setTab('accepted')}
          >
            In Progress <span className="badge" style={{marginLeft:6}}>{accepted.length}</span>
          </button>
        </div>

        {error && <div className="error" style={{marginBottom:20}}>{error}</div>}

        {/* PENDING TAB */}
        {tab==='pending' && (
          <div>
            {pending.length ? (
              <div className="grid" style={{gap:18}}>
                {pending.map((req) => (
                  <div className="card" style={{padding:18, borderLeft:'4px solid #ffae42'}} key={req.id}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <b>User:</b> {userLabel(req.user)}<br/>
                        <b>Vehicle:</b> {req.vehicle?.plateNumber} <span className="muted">({req.vehicle?.type})</span><br/>
                        <b>Fuel:</b> {req.fuelType}<br/>
                        <b>Amount:</b> {req.amount} • <b>Total:</b> {req.totalCost}
                        <div className="muted" style={{fontSize:12,marginTop:3}}>
                          Requested: {fmt(req.createdAt)}
                        </div>
                      </div>
                      <div style={{display:'flex', flexDirection:'column', gap:8}}>
                        <button
                          className="btn"
                          style={{minWidth:100}}
                          disabled={loading || actionId===req.id}
                          onClick={() => accept(req.id)}
                        >{actionId===req.id ? 'Working...' : 'Accept'}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ):(
              <div className="muted" style={{marginTop: 12}}>No pending requests 🎉</div>
            )}
          </div>
        )}

        {/* ACCEPTED TAB */}
        {tab === 'accepted' && (
          <div>
            {accepted.length ? (
              <div className="grid" style={{gap:18}}>
                {accepted.map((req) => (
                  <div className="card" style={{padding:18, borderLeft:'4px solid #5cb85c'}} key={req.id}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <b>User:</b> {userLabel(req.user)}<br/>
                        <b>Vehicle:</b> {req.vehicle?.plateNumber} <span className="muted">({req.vehicle?.type})</span><br/>
                        <b>Fuel:</b> {req.fuelType}<br/>
                        <b>Amount:</b> {req.amount} • <b>Total:</b> {req.totalCost}
                        <div className="muted" style={{fontSize:12,marginTop:3}}>
                          Accepted: {fmt(req.acceptedAt)}
                        </div>
                      </div>
                      <div style={{display:'flex', flexDirection:'column', gap:8}}>
                        <button
                          className="btn"
                          style={{minWidth:100}}
                          disabled={loading || actionId===req.id}
                          onClick={() => complete(req.id)}
                        >{actionId===req.id ? 'Working...' : 'Complete & Give Fuel'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ):(
              <div className="muted" style={{marginTop: 12}}>No accepted/in-progress requests yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}