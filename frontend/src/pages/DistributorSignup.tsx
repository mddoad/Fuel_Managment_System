import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

function isGmail(email: string) {
  return /^[^\s@]+@gmail\.com$/i.test(email.trim());
}

function isBDPhone(phone: string) {
  return /^(\+8801|01)[3-9]\d{8}$/.test(phone.trim());
}

function isStrongPassword(p: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(p);
}

export default function DistributorSignup() {
  const navigate = useNavigate();

  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [stationName, setStationName] = useState('');
  const [stationPhone, setStationPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [licensePdf, setLicensePdf] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!ownerName.trim()) return setError('Owner name is required');
    if (!isBDPhone(ownerPhone)) return setError('Owner phone must be a valid Bangladesh number');
    if (!stationName.trim()) return setError('Filling station name is required');
    if (!isBDPhone(stationPhone)) return setError('Filling station phone must be a valid Bangladesh number');
    if (!address.trim()) return setError('Address is required');
    if (!isGmail(email)) return setError('Email must be a Gmail address (example@gmail.com)');

    if (!isStrongPassword(password))
      return setError('Password must be 8+ and include uppercase, lowercase, number, and special character');
    if (password !== confirmPassword) return setError('Confirm password does not match');

    if (!licensePdf) return setError('Filling station license PDF is required');
    if (licensePdf.type !== 'application/pdf') return setError('License must be PDF format');
    if (licensePdf.size > 5 * 1024 * 1024) return setError('PDF must be under 5MB');

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
      await api.post('/distributors/register', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMsg('Application submitted. Please wait for admin approval before login.');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Distributor registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '28px 0' }}>
      <div className="card" style={{ width: 'min(860px, 100%)', padding: 20 }}>
        <div className="badge" style={{ marginBottom: 12 }}>Sign up as Distributor</div>
        <h2 style={{ marginTop: 0 }}>Submit application</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          After you submit, admin must approve before you can login.
        </p>

        <form onSubmit={onSubmit}>
          <div className="grid grid-2">
            <div>
              <label className="label">Owner name</label>
              <input className="input" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            </div>

            <div>
              <label className="label">Owner phone (Bangladesh)</label>
              <input className="input" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="01XXXXXXXXX" />
            </div>

            <div>
              <label className="label">Filling station name</label>
              <input className="input" value={stationName} onChange={(e) => setStationName(e.target.value)} />
            </div>

            <div>
              <label className="label">Filling station phone (Bangladesh)</label>
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
              <label className="label">License (PDF)</label>
              <input
                className="input"
                type="file"
                accept="application/pdf"
                onChange={(e) => setLicensePdf(e.target.files?.[0] ?? null)}
              />
              {licensePdf && (
                <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                  Selected: {licensePdf.name}
                </div>
              )}
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

          {error && <div className="error" style={{ marginTop: 12 }}>{String(error)}</div>}
          {successMsg && (
            <div className="card" style={{ marginTop: 12, padding: 12, borderRadius: 12 }}>
              <b>Success:</b> <span className="muted">{successMsg}</span>
              <div style={{ marginTop: 10 }}>
                <button className="btn" type="button" onClick={() => navigate('/login')}>
                  Go to login
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Confirm application'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate('/signup')}>
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}