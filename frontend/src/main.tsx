import './index.css';

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { api } from './api/client';

import Dashboard from './pages/Dashboard'; // (you can keep for now; later we will use DistributorDashboard)
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserSignup from './pages/UserSignup';
import DistributorSignup from './pages/DistributorSignup';
import ForgotPassword from './pages/ForgotPassword';

import AdminDashboard from './pages/AdminDashboard';
import AdminDistributorRequests from './pages/AdminDistributorRequests';
import AdminDistributorRequestDetails from './pages/AdminDistributorRequestDetails';

import AdminAddAdmin from './pages/admin/AdminAddAdmin';
import AdminAddUser from './pages/admin/AdminAddUser';
import AdminAddDistributor from './pages/admin/AdminAddDistributor';

// NEW user pages
import UserDashboard from './pages/user/UserDashboard';
import MyVehicles from './pages/user/MyVehicles';
import ApplyVehicle from './pages/user/ApplyVehicle';

import AdminVehicleRequests from './pages/admin/AdminVehicleRequests';
import AdminVehicleRequestDetails from './pages/admin/AdminVehicleRequestDetails';
import AdminFuelPrices from './pages/admin/AdminFuelPrices';
import TakeFuelRequest from './pages/user/TakeFuelRequest';
import DistributorRequests from './pages/distributor/DistributorRequests';

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
  if (me.role === 'USER') return <UserDashboard />;

  // DISTRIBUTOR: for now keep old dashboard until we build distributor dashboard
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

        {/* USER routes */}
        <Route
          path="/user/vehicles"
          element={
            <RequireAuth>
              <MyVehicles />
            </RequireAuth>
          }
        />
        <Route
          path="/user/vehicles/apply"
          element={
            <RequireAuth>
              <ApplyVehicle />
            </RequireAuth>
          }
        />

        {/* Admin routes */}
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
        <Route
          path="/admin/add-admin"
          element={
            <RequireAuth>
              <AdminAddAdmin />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/add-user"
          element={
            <RequireAuth>
              <AdminAddUser />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/add-distributor"
          element={
            <RequireAuth>
              <AdminAddDistributor />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/vehicle-requests"
          element={
            <RequireAuth>
              <AdminVehicleRequests />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/vehicle-requests/:id"
          element={
            <RequireAuth>
              <AdminVehicleRequestDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/fuel-prices"
          element={
            <RequireAuth>
              <AdminFuelPrices />
            </RequireAuth>
          }
        />

        <Route
          path="/user/vehicles/:id/fuel"
          element={
            <RequireAuth>
              <TakeFuelRequest />
            </RequireAuth>
          }
        />

        <Route
          path="/distributor/requests"
          element={
            <RequireAuth>
              <DistributorRequests />
            </RequireAuth>
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);