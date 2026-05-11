import { useMemo, useState } from 'react';
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

function calcAge(dob: string) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return -1;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

export default function UserSignup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState(''); // YYYY-MM-DD
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const age = useMemo(() => (dob ? calcAge(dob) : null), [dob]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Frontend validation (same rules as backend)
    if (!fullName.trim()) return setError('Name is required');
    if (!isGmail(email)) return setError('Email must be a Gmail address (example@gmail.com)');
    if (!isBDPhone(phone)) return setError('Phone must be a valid Bangladesh number');
    if (!dob) return setError('Date of birth is required');
    if ((age ?? -1) < 18) return setError('You must be at least 18 years old');
    if (!isStrongPassword(password))
      return setError('Password must be 8+ and include uppercase, lowercase, number, and special character');
    if (password !== confirmPassword) return setError('Confirm password does not match');

    setLoading(true);
    try {
      await api.post('/auth/register/user', {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dob,
        password,
        confirmPassword,
      });

      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '28px 0' }}>
      <div className="card" style={{ width: 'min(760px, 100%)', padding: 20 }}>
        <div className="badge" style={{ marginBottom: 12 }}>Sign up as User</div>
        <h2 style={{ marginTop: 0 }}>Create your account</h2>
        <p className="muted" style={{ marginTop: 0 }}>All fields are required.</p>

        <form onSubmit={onSubmit}>
          <div className="grid grid-2">
            <div>
              <label className="label">Full name</label>
              <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div>
              <label className="label">Gmail</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" />
            </div>

            <div>
              <label className="label">Phone (Bangladesh)</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
            </div>

            <div>
              <label className="label">Date of birth</label>
              <input className="input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              {age !== null && age >= 0 && (
                <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Age: {age}</div>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                Must be 8+ with A-Z, a-z, 0-9, special character.
              </div>
            </div>

            <div>
              <label className="label">Confirm password</label>
              <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          {error && <div className="error" style={{ marginTop: 12 }}>{String(error)}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Confirm sign up'}
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