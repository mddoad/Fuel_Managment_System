import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

function isBDPhone(phone: string) {
  return /^(\+8801|01)[3-9]\d{8}$/.test(phone.trim());
}

// simple plate validation used in backend too
function isBDPlateLike(value: string) {
  return /^[A-Z0-9\- ]{5,30}$/i.test(value.trim());
}

const VEHICLE_TYPES = ['CAR', 'BIKE', 'TRUCK', 'PICKUP', 'BUS', 'MICRO', 'OTHERS'];

export default function ApplyVehicle() {
  const navigate = useNavigate();

  const [type, setType] = useState(VEHICLE_TYPES[0]);
  const [plateNumber, setPlateNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [registrationPdf, setRegistrationPdf] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!type) return setError('Vehicle type required');
    if (!plateNumber.trim()) return setError('Vehicle number required');
    if (!isBDPlateLike(plateNumber)) return setError('Vehicle number invalid');
    if (!ownerName.trim()) return setError('Owner name required');
    if (!isBDPhone(ownerPhone)) return setError('Owner phone invalid');
    if (!registrationPdf) return setError('Registration PDF required');
    if (registrationPdf.type !== 'application/pdf') return setError('Registration must be PDF');
    if (registrationPdf.size > 5 * 1024 * 1024) return setError('PDF must be under 5MB');

    const form = new FormData();
    form.append('type', type);
    form.append('plateNumber', plateNumber.trim());
    form.append('ownerName', ownerName.trim());
    form.append('ownerPhone', ownerPhone.trim());
    form.append('registrationPdf', registrationPdf);

    setLoading(true);
    try {
      await api.post('/vehicles/apply', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Vehicle request submitted. Wait for admin approval.');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div className="card" style={{ padding: 18 }}>
        <div className="badge" style={{ marginBottom: 10 }}>User</div>
        <h2 style={{ marginTop: 0 }}>Apply to Add Vehicle</h2>

        <form onSubmit={onSubmit} className="grid" style={{ gap: 12 }}>
          <div className="grid grid-2">
            <div>
              <label className="label">Vehicle type</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Vehicle number</label>
              <input className="input" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="DHAKA-12-3456" />
            </div>

            <div>
              <label className="label">Owner name</label>
              <input className="input" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            </div>

            <div>
              <label className="label">Owner phone</label>
              <input className="input" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="01XXXXXXXXX" />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Registration paper (PDF)</label>
              <input className="input" type="file" accept="application/pdf" onChange={(e) => setRegistrationPdf(e.target.files?.[0] ?? null)} />
            </div>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="card" style={{ padding: 12 }}>{success}</div>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate('/')}>Back</button>
          </div>
        </form>
      </div>
    </div>
  );
}