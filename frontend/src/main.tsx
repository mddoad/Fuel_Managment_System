import './index.css';

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { api } from './api/client';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserSignup from './pages/UserSignup';
import DistributorSignup from './pages/DistributorSignup';
import ForgotPassword from './pages/ForgotPassword';

import AdminDashboard from './pages/AdminDashboard';
import AdminDistributorRequests from './pages/AdminDistributorRequests';
import AdminDistributorRequestDetails from './pages/AdminDistributorRequestDetails';

type Me = { id: number; role: 'ADMIN' | 'USER' | 'DISTRIBUTOR' };

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function HomeRouter() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/auth/me');
        setMe(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="container" style={{ padding: '28px 0' }}>Loading...</div>;
  if (!me) return <Navigate to="/login" replace />;

  if (me.role === 'ADMIN') return <AdminDashboard />;
  return <Dashboard />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/user" element={<UserSignup />} />
        <Route path="/signup/distributor" element={<DistributorSignup />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomeRouter />
            </RequireAuth>
          }
        />

        {/* Admin protected routes */}
        <Route
          path="/admin/distributor-requests"
          element={
            <RequireAuth>
              <AdminDistributorRequests />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/distributor-requests/:id"
          element={
            <RequireAuth>
              <AdminDistributorRequestDetails />
            </RequireAuth>
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);