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
function calcAge(dob: string) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return -1;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

export default function AdminAddUser() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim()) return setError('Name is required');
    if (!isGmail(email)) return setError('Email must be Gmail (example@gmail.com)');
    if (!isBDPhone(phone)) return setError('Phone must be valid Bangladesh number');
    if (!dob) return setError('DOB is required');
    if (calcAge(dob) < 18) return setError('Must be at least 18 years old');
    if (!isStrongPassword(password)) return setError('Password is not strong enough');
    if (password !== confirmPassword) return setError('Confirm password does not match');

    setLoading(true);
    try {
      await api.post('/admin/users', {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dob,
        password,
        confirmPassword,
        role: 'USER',
      });
      setSuccess('User created successfully');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div className="card" style={{ padding: 18 }}>
        <div className="badge" style={{ marginBottom: 10 }}>Admin</div>
        <h2 style={{ marginTop: 0 }}>Add User</h2>

        <form onSubmit={onSubmit} className="grid" style={{ gap: 12 }}>
          <div className="grid grid-2">
            <div>
              <label className="label">Name</label>
              <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="label">Gmail</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
            <div>
              <label className="label">DOB</label>
              <input className="input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="card" style={{ padding: 12 }}>{success}</div>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" disabled={loading}>{loading ? 'Saving...' : 'Create User'}</button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate('/')}>Back</button>
          </div>
        </form>
      </div>
    </div>
  );
}