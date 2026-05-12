import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

function isGmail(email: string) {
  return /^[^\s@]+@gmail\.com$/i.test(email.trim());
}
function isBDPhone(phone: string) {
  return /^(\+8801|01)[3-9]\d{8}$/.test(phone.trim());
}
function isStrongPassword(p: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(p);
}

export default function AdminAddDistributor() {
  const navigate = useNavigate();

  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [stationName, setStationName] = useState('');
  const [stationPhone, setStationPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [licensePdf, setLicensePdf] = useState<File | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!ownerName.trim()) return setError('Owner name is required');
    if (!isBDPhone(ownerPhone)) return setError('Owner phone must be valid Bangladesh number');
    if (!stationName.trim()) return setError('Filling station name is required');
    if (!isBDPhone(stationPhone)) return setError('Filling station phone must be valid Bangladesh number');
    if (!address.trim()) return setError('Address is required');
    if (!isGmail(email)) return setError('Email must be Gmail (example@gmail.com)');

    if (!licensePdf) return setError('License PDF is required');
    if (licensePdf.type !== 'application/pdf') return setError('License must be PDF');
    if (licensePdf.size > 5 * 1024 * 1024) return setError('PDF must be under 5MB');

    if (!isStrongPassword(password)) return setError('Password is not strong enough');
    if (password !== confirmPassword) return setError('Confirm password does not match');

    const form = new FormData();
    form.append('ownerName', ownerName.trim());
    form.append('ownerPhone', ownerPhone.trim());
    form.append('stationName', stationName.trim());
    form.append('stationPhone', stationPhone.trim());
    form.append('address', address.trim());
    form.append('email', email.trim());
    form.append('password', password);
    form.append('confirmPassword', confirmPassword);
    form.append('licensePdf', licensePdf);

    setLoading(true);
    try {
      await api.post('/admin/distributors', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Distributor created successfully (can login now).');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create distributor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div className="card" style={{ padding: 18 }}>
        <div className="badge" style={{ marginBottom: 10 }}>Admin</div>
        <h2 style={{ marginTop: 0 }}>Add Distributor</h2>
        <p className="muted" style={{ marginTop: 0 }}>Created by admin → no waiting for approval.</p>

        <form onSubmit={onSubmit} className="grid" style={{ gap: 12 }}>
          <div className="grid grid-2">
            <div>
              <label className="label">Owner name</label>
              <input className="input" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            </div>
            <div>
              <label className="label">Owner phone</label>
              <input className="input" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
            <div>
              <label className="label">Filling station name</label>
              <input className="input" value={stationName} onChange={(e) => setStationName(e.target.value)} />
            </div>
            <div>
              <label className="label">Filling station phone</label>
              <input className="input" value={stationPhone} onChange={(e) => setStationPhone(e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Address</label>
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <label className="label">Gmail</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" />
            </div>
            <div>
              <label className="label">License PDF</label>
              <input className="input" type="file" accept="application/pdf" onChange={(e) => setLicensePdf(e.target.files?.[0] ?? null)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="card" style={{ padding: 12 }}>{success}</div>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" disabled={loading}>{loading ? 'Saving...' : 'Create Distributor'}</button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate('/')}>Back</button>
          </div>
        </form>
      </div>
    </div>
  );
}