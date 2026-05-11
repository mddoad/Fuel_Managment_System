import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { identifier, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '28px 0' }}>
      <div className="card" style={{ width: 'min(920px, 100%)', overflow: 'hidden' }}>
        <div className="grid grid-2">
          {/* Left side */}
          <div style={{ padding: 24 }}>
            <div className="badge" style={{ marginBottom: 14 }}>
              Fuel Management System
            </div>

            <h1 style={{ margin: '0 0 10px 0', fontSize: 34, lineHeight: 1.1 }}>
              Welcome back
            </h1>
            <p className="muted" style={{ marginTop: 0, marginBottom: 20 }}>
              Login to record fuel logs, view stations & vehicles, and manage your daily usage.
            </p>

            <div className="card" style={{ padding: 16, borderRadius: 14 }}>
              <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                Tips:
              </div>
              <ul className="muted" style={{ margin: 0, paddingLeft: 16 }}>
                <li>Run backend on <b>http://localhost:3000</b></li>
                <li>Run frontend on <b>http://localhost:5173</b></li>
                <li>Admin creates stations & vehicles</li>
              </ul>
            </div>
          </div>

          {/* Right side (form) */}
          <div style={{ padding: 24, borderLeft: '1px solid rgba(255,255,255,0.10)' }}>
            <h2 style={{ marginTop: 0, marginBottom: 14 }}>Login</h2>

            <form onSubmit={onSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label className="label">Email or phone</label>
                <input
                  className="input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="email@example.com or phone"
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="your password"
                />
              </div>

              {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

              <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>
                Your token is saved in <b>localStorage</b> after login.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}