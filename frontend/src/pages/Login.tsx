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
    <div
      className="container"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '28px 0',
      }}
    >
      <div className="card" style={{ width: 'min(980px, 100%)', overflow: 'hidden' }}>
        <div className="grid grid-2" style={{ gap: 0 }}>
          {/* Left / Welcome */}
          <div style={{ padding: 26 }}>
            <div className="badge" style={{ marginBottom: 14 }}>
              Fuel Management System
            </div>

            <h1 style={{ margin: '0 0 10px 0', fontSize: 34, lineHeight: 1.1 }}>
              Welcome to Fuel Management System
            </h1>

            <p className="muted" style={{ marginTop: 0, marginBottom: 0, fontSize: 14, lineHeight: 1.6 }}>
              Sign in to record fuel logs, track costs, and view stations and vehicles.
              <br />
              Keep everything organized in one place.
            </p>
          </div>

          {/* Right / Form */}
          <div
            style={{
              padding: 26,
              borderLeft: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 14 }}>Sign in</h2>

            <form onSubmit={onSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label className="label">Email or phone number</label>
                <input
                  className="input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="email@example.com or 09xxxxxxxx"
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/forgot-password')}
                  style={{ padding: '8px 12px' }}
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="error" style={{ marginBottom: 12 }}>
                  {error}
                </div>
              )}

              <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <div style={{ marginTop: 12, textAlign: 'center' }} className="muted">
                Don&apos;t have an account?
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/signup')}
                style={{ width: '100%', marginTop: 10 }}
              >
                Sign up
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="muted" style={{ marginTop: 14, fontSize: 12 }}>
        © {new Date().getFullYear()} Fuel Management System
      </div>
    </div>
  );
}