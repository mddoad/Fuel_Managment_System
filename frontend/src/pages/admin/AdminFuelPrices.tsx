import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

type FuelPrice = {
  id: number;
  fuelType: 'OCTANE' | 'DIESEL' | 'CNG';
  pricePerUnit: number;
};

export default function AdminFuelPrices() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FuelPrice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await api.get('/fuel-prices');
        setItems(res.data);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login', { replace: true });
          return;
        }
        setError(err?.response?.data?.message ?? 'Failed to load fuel prices');
      }
    })();
  }, [navigate]);

  function setPrice(fuelType: FuelPrice['fuelType'], value: string) {
    setItems((prev) =>
      prev.map((p) =>
        p.fuelType === fuelType ? { ...p, pricePerUnit: Number(value) } : p,
      ),
    );
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await api.put('/fuel-prices', {
        items: items.map((i) => ({ fuelType: i.fuelType, pricePerUnit: Number(i.pricePerUnit) })),
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to save prices');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="badge" style={{ marginBottom: 10 }}>Admin</div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Fuel Prices</h1>
          <div className="muted" style={{ marginTop: 8 }}>
            Set price per liter/unit.
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Back</button>
      </div>

      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 16, marginTop: 14 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Fuel Type</th>
              <th style={{ width: 240 }}>Price per unit</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.fuelType}>
                <td style={{ fontWeight: 800 }}>{p.fuelType}</td>
                <td>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    step="0.01"
                    value={Number.isFinite(p.pricePerUnit) ? p.pricePerUnit : 0}
                    onChange={(e) => setPrice(p.fuelType, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button className="btn" onClick={save} disabled={saving || items.length === 0}>
            {saving ? 'Saving...' : 'Save Prices'}
          </button>
        </div>
      </div>
    </div>
  );
}