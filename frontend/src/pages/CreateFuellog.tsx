import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

type Station = { id: number; name: string };
type Vehicle = { id: number; plateNumber: string };

export default function CreateFuelLog() {
  const navigate = useNavigate();

  const [stations, setStations] = useState<Station[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [stationId, setStationId] = useState<number | ''>('');
  const [vehicleId, setVehicleId] = useState<number | ''>('');

  const [date, setDate] = useState<string>(() => {
    // datetime-local expects: YYYY-MM-DDTHH:mm
    return new Date().toISOString().slice(0, 16);
  });

  const [liters, setLiters] = useState<number>(1);
  const [pricePerLiter, setPricePerLiter] = useState<number>(1);

  const [meterReading, setMeterReading] = useState<number | ''>('');
  const [note, setNote] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCost = useMemo(() => {
    const value = liters * pricePerLiter;
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  }, [liters, pricePerLiter]);

  useEffect(() => {
    (async () => {
      try {
        const [stRes, vhRes] = await Promise.all([api.get('/stations'), api.get('/vehicles')]);

        setStations(stRes.data);
        setVehicles(vhRes.data);

        if (stRes.data.length > 0) setStationId(stRes.data[0].id);
        if (vhRes.data.length > 0) setVehicleId(vhRes.data[0].id);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login', { replace: true });
          return;
        }
        setError(err?.response?.data?.message ?? 'Failed to load stations/vehicles');
      }
    })();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (stationId === '' || vehicleId === '') {
      setError('Please select station and vehicle.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/fuel-logs', {
        stationId,
        vehicleId,
        date: new Date(date).toISOString(),
        liters,
        pricePerLiter,
        totalCost,
        meterReading: meterReading === '' ? undefined : meterReading,
        note: note.trim() === '' ? undefined : note.trim(),
      });

      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create fuel log');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Create Fuel Log</h2>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Station</label>
          <select
            style={{ width: '100%', padding: 8 }}
            value={stationId}
            onChange={(e) => setStationId(Number(e.target.value))}
          >
            {stations.length === 0 ? (
              <option value="">No stations found (create as ADMIN)</option>
            ) : (
              stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Vehicle</label>
          <select
            style={{ width: '100%', padding: 8 }}
            value={vehicleId}
            onChange={(e) => setVehicleId(Number(e.target.value))}
          >
            {vehicles.length === 0 ? (
              <option value="">No vehicles found (create as ADMIN)</option>
            ) : (
              vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber}
                </option>
              ))
            )}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Date & Time</label>
          <input
            style={{ width: '100%', padding: 8 }}
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Liters</label>
          <input
            style={{ width: '100%', padding: 8 }}
            type="number"
            step="0.01"
            value={liters}
            onChange={(e) => setLiters(Number(e.target.value))}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Price per liter</label>
          <input
            style={{ width: '100%', padding: 8 }}
            type="number"
            step="0.01"
            value={pricePerLiter}
            onChange={(e) => setPricePerLiter(Number(e.target.value))}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Total cost (auto)</label>
          <input style={{ width: '100%', padding: 8 }} value={totalCost} readOnly />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Meter reading (optional)</label>
          <input
            style={{ width: '100%', padding: 8 }}
            type="number"
            value={meterReading}
            onChange={(e) => setMeterReading(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Note (optional)</label>
          <input style={{ width: '100%', padding: 8 }} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <button type="submit" disabled={loading || stations.length === 0 || vehicles.length === 0}>
          {loading ? 'Saving...' : 'Save Fuel Log'}
        </button>

        <button type="button" style={{ marginLeft: 8 }} onClick={() => navigate('/')}>
          Cancel
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}