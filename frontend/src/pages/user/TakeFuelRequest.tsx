import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';

type Vehicle = { id: number; plateNumber: string; type: string };
type Station = { id: number; name: string; address?: string };
type FuelPrice = { fuelType: 'OCTANE' | 'DIESEL' | 'CNG'; pricePerUnit: number };

export default function TakeFuelRequest() {
  const { id } = useParams();
  const vehicleId = Number(id);

  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [prices, setPrices] = useState<FuelPrice[]>([]);
  const [query, setQuery] = useState('');

  const [stationId, setStationId] = useState<number | ''>('');
  const [fuelType, setFuelType] = useState<'OCTANE' | 'DIESEL' | 'CNG'>('OCTANE');
  const [amount, setAmount] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const pricePerUnit = useMemo(() => {
    const row = prices.find((p) => p.fuelType === fuelType);
    return row ? Number(row.pricePerUnit) : 0;
  }, [prices, fuelType]);

  const total = useMemo(() => Number((amount * pricePerUnit).toFixed(2)), [amount, pricePerUnit]);

  const filteredStations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter((s) => s.name.toLowerCase().includes(q) || (s.address ?? '').toLowerCase().includes(q));
  }, [stations, query]);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const [vhRes, stRes, prRes] = await Promise.all([
          api.get('/vehicles/mine'),
          api.get('/stations'),
          api.get('/fuel-prices'),
        ]);

        const myVehicles: Vehicle[] = vhRes.data;
        const found = myVehicles.find((v) => v.id === vehicleId) ?? null;
        setVehicle(found);

        setStations(stRes.data);
        setPrices(prRes.data);

        if (stRes.data.length > 0) setStationId(stRes.data[0].id);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login', { replace: true });
          return;
        }
        setError(err?.response?.data?.message ?? 'Failed to load data');
      }
    })();
  }, [navigate, vehicleId]);

  async function submit() {
    setError(null);
    setSuccess(null);

    if (!vehicle) return setError('Vehicle not found (not approved or not yours)');
    if (stationId === '') return setError('Select a station');
    if (!amount || amount <= 0) return setError('Amount must be greater than 0');
    if (!pricePerUnit || pricePerUnit <= 0) return setError('Fuel price not set by admin yet');

    setLoading(true);
    try {
      await api.post('/fuel-requests', {
        vehicleId: vehicle.id,
        stationId,
        fuelType,
        amount,
      });
      setSuccess('Fuel request sent to station.');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to send request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="badge" style={{ marginBottom: 10 }}>User</div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Take Fuel</h1>
          {vehicle && <div className="muted" style={{ marginTop: 8 }}>Vehicle: <b style={{ color: 'white' }}>{vehicle.plateNumber}</b></div>}
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/user/vehicles')}>Back</button>
      </div>

      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}
      {success && <div className="card" style={{ padding: 12, marginTop: 16 }}>{success}</div>}

      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Fuel info</div>

          <label className="label">Fuel type</label>
          <select className="input" value={fuelType} onChange={(e) => setFuelType(e.target.value as any)}>
            <option value="OCTANE">OCTANE</option>
            <option value="DIESEL">DIESEL</option>
            <option value="CNG">CNG</option>
          </select>

          <label className="label" style={{ marginTop: 10 }}>Amount</label>
          <input className="input" type="number" min={0.1} step="0.1" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />

          <div className="muted" style={{ marginTop: 10 }}>
            Price: <b style={{ color: 'white' }}>{pricePerUnit}</b> <br />
            Total: <b style={{ color: 'white' }}>{total}</b>
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Choose station</div>

          <input className="input" placeholder="Search station..." value={query} onChange={(e) => setQuery(e.target.value)} />

          <div style={{ marginTop: 10 }}>
            <select className="input" value={stationId} onChange={(e) => setStationId(Number(e.target.value))}>
              {filteredStations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.address ? ` — ${s.address}` : ''}
                </option>
              ))}
            </select>
          </div>

          <button className="btn" style={{ marginTop: 12 }} onClick={submit} disabled={loading}>
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}