import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

type Me = { id: number; email?: string; phone?: string; role: 'ADMIN' | 'USER' | 'DISTRIBUTOR' };

export default function AdminDashboard() {
  const [me, setMe] = useState<Me | null>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('accessToken');
    navigate('/login', { replace: true });
  }

  useEffect(() => {
    (async () => {
      const res = await api.get('/auth/me');
      setMe(res.data);
    })().catch(() => {
      localStorage.removeItem('accessToken');
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpenMenu(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* 3 dot menu */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setOpenMenu((v) => !v)}
              style={{ width: 44, height: 44, padding: 0, borderRadius: 12 }}
              aria-label="Menu"
              title="Menu"
            >
              ⋮
            </button>

            {openMenu && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  top: 52,
                  left: 0,
                  width: 220,
                  padding: 10,
                  borderRadius: 12,
                  zIndex: 10,
                }}
              >
                <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                  Admin actions
                </div>

                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', marginBottom: 8 }}
                  onClick={() => navigate('/admin/add-admin')}
                >
                  + Add Admin
                </button>

                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', marginBottom: 8 }}
                  onClick={() => navigate('/admin/add-user')}
                >
                  + Add User
                </button>

                <button
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                  onClick={() => navigate('/admin/add-distributor')}
                >
                  + Add Distributor
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="badge" style={{ marginBottom: 10 }}>Fuel Management</div>
            <h1 style={{ margin: 0, fontSize: 30 }}>Admin Dashboard</h1>
            {me && (
              <div className="muted" style={{ marginTop: 8 }}>
                Logged in as <b style={{ color: 'white' }}>{me.email ?? me.phone ?? 'Admin'}</b> •{' '}
                <span className="badge">ADMIN</span>
              </div>
            )}
          </div>
        </div>

        <button className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Main */}
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>Distributor Requests</div>
          <div className="muted" style={{ marginBottom: 12 }}>
            Review new distributor applications, view license PDF, and approve.
          </div>

          <Link className="btn" to="/admin/distributor-requests">
            Open Requests
          </Link>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>Coming next</div>
          <div className="muted">
            Stations/Vehicles management, user management, reports, etc.
          </div>
        </div>
      </div>
    </div>
  );
}