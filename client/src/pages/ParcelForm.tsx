import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import type { Parcel } from '../types';
import { PageHeader } from '../components/ui';

const REGIONS = ['Centre', 'Littoral', 'Ouest', 'Nord', 'Extrême-Nord'];
const SOILS = ['Ferrallitique', 'Volcanique', 'Vertisol', 'Sableux', 'Hydromorphe', 'Argileux'];

export default function ParcelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({
    name: '',
    lat: '3.85',
    lon: '11.50',
    area_ha: '1.0',
    soil_type: 'Ferrallitique',
    irrigation: 'pluvial',
    region: 'Centre'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      api.get<Parcel>(`/api/parcels/${id}`).then((p) =>
        setForm({
          name: p.name,
          lat: String(p.lat),
          lon: String(p.lon),
          area_ha: String(p.area_ha),
          soil_type: p.soil_type || 'Ferrallitique',
          irrigation: p.irrigation || 'pluvial',
          region: p.region || 'Centre'
        })
      );
    }
  }, [id]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        lat: parseFloat(form.lat),
        lon: parseFloat(form.lon),
        area_ha: parseFloat(form.area_ha)
      };
      if (isEdit) await api.put(`/api/parcels/${id}`, payload);
      else await api.post('/api/parcels', payload);
      navigate('/parcels');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={isEdit ? 'Modifier la parcelle' : 'Nouvelle parcelle'} subtitle="Renseignez les caractéristiques de votre parcelle." />
      <div className="card p-6">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Nom de la parcelle</label>
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex. Champ de Nkolbisson" required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Latitude</label>
              <input className="input" type="number" step="any" value={form.lat} onChange={(e) => set('lat', e.target.value)} required />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input className="input" type="number" step="any" value={form.lon} onChange={(e) => set('lon', e.target.value)} required />
            </div>
            <div>
              <label className="label">Superficie (ha)</label>
              <input className="input" type="number" step="any" min="0.1" value={form.area_ha} onChange={(e) => set('area_ha', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Type de sol</label>
              <select className="input" value={form.soil_type} onChange={(e) => set('soil_type', e.target.value)}>
                {SOILS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Irrigation</label>
              <select className="input" value={form.irrigation} onChange={(e) => set('irrigation', e.target.value)}>
                <option value="pluvial">Pluvial</option>
                <option value="irrigué">Irrigué</option>
              </select>
            </div>
            <div>
              <label className="label">Région</label>
              <select className="input" value={form.region} onChange={(e) => set('region', e.target.value)}>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl bg-primary-light p-4 text-xs leading-relaxed text-gray-600">
            💡 La localisation peut aussi être définie par GPS sur l'application mobile ou par pointé sur carte.
          </div>

          {error && <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer la parcelle'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => navigate('/parcels')}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
