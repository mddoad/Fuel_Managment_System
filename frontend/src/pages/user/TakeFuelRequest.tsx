import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';

type Vehicle = { id: number; plateNumber: string; type: string };
type FuelPrice = { fuelType: 'OCTANE' | 'DIESEL' | 'CNG'; pricePerUnit: number };

// response from GET /public/distributors/stations
type DistStation = {
  stationId: number;
  stationName: string;
  stationPhone?: string;
  address?: string;
  userId?: number; // optional, ok if backend includes it
};

export default function TakeFuelRequest() {
  const { id } = useParams();
  const vehicleId = Number(id);

  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [stations, setStations] = useState<DistStation[]>([]);
  const [prices, setPrices] = useState<FuelPrice[]>([]);
  const [query, setQuery] = useState('');

  const [stationId, setStationId] = useState<number | ''>(''); // '' means not selected
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

    return stations.filter((s) => {
      const name = (s.stationName ?? '').toLowerCase();
      const addr = (s.address ?? '').toLowerCase();
      return name.includes(q) || addr.includes(q);
    });
  }, [stations, query]);

  useEffect(() => {
    (async () => {
      try {
        setError(null);

        const [vhRes, stRes, prRes] = await Promise.all([
          api.get('/vehicles/mine'),
          api.get('/public/distributors/stations'),
          api.get('/fuel-prices'),
        ]);

        const myVehicles: Vehicle[] = vhRes.data ?? [];
        const found = myVehicles.find((v) => v.id === vehicleId) ?? null;
        setVehicle(found);

        const distStations: DistStation[] = (stRes.data ?? []).map((s: any) => ({
          ...s,
          stationId: Number(s.stationId),
        }));

        const validStations = distStations.filter((s) => Number.isInteger(s.stationId) && s.stationId > 0);

        setStations(validStations);
        setPrices(prRes.data ?? []);

        if (validStations.length > 0) setStationId(validStations[0].stationId);
        else setStationId('');
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
    if (stationId === '' || !Number.isInteger(stationId)) return setError('Select a station');
    if (!amount || amount <= 0) return setError('Amount must be greater than 0');
    if (!pricePerUnit || pricePerUnit <= 0) return setError('Fuel price not set by admin yet');

    setLoading(true);
    try {
      await api.post('/fuel-requests', {
        vehicleId: vehicle.id,
        stationId: Number(stationId),
        fuelType,
        amount: Number(amount),
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
          {vehicle && (
            <div className="muted" style={{ marginTop: 8 }}>
              Vehicle: <b style={{ color: 'white' }}>{vehicle.plateNumber}</b>
            </div>
          )}
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
          <input
            className="input"
            type="number"
            min={0.1}
            step="0.1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />

          <div className="muted" style={{ marginTop: 10 }}>
            Price: <b style={{ color: 'white' }}>{pricePerUnit}</b> <br />
            Total: <b style={{ color: 'white' }}>{total}</b>
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Choose filling station</div>

          <input
            className="input"
            placeholder="Search station..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div style={{ marginTop: 10 }}>
            <select
              className="input"
              value={stationId === '' ? '' : String(stationId)}
              onChange={(e) => setStationId(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={stations.length === 0}
            >
              {stations.length === 0 && <option value="">No stations</option>}

              {filteredStations.map((s) => (
                <option key={s.stationId} value={String(s.stationId)}>
                  {s.stationName}{s.address ? ` — ${s.address}` : ''}
                </option>
              ))}
            </select>
          </div>

          <button className="btn" style={{ marginTop: 12 }} onClick={submit} disabled={loading || stations.length === 0}>
            {loading ? 'Sending...' : 'Send Request'}
          </button>

          {stations.length === 0 && (
            <div className="muted" style={{ marginTop: 10 }}>
              No distributor stations found. Please approve a distributor (so stationId gets created).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}