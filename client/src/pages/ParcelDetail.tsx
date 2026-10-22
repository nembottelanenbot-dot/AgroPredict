import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import type { Parcel, Prediction, Crop } from '../types';
import { Spinner, cropIcon, formatNumber } from '../components/ui';

const CROP_TYPES = ['Maïs', 'Riz', 'Sorgho', 'Mil', 'Manioc', 'Igname', 'Patate douce', 'Arachide', 'Haricot', 'Niébé', 'Cacao', 'Café', 'Coton', 'Tomate', 'Oignon', 'Poivron'];

export default function ParcelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newCrop, setNewCrop] = useState({ crop_type: 'Maïs', variety: '', sowing_date: '' });

  useEffect(() => {
    api.get<Parcel>(`/api/parcels/${id}`).then((p) => {
      setParcel(p);
      (p.crops || []).forEach((c) => {
        api.get<Prediction>(`/api/predictions/${c.id}`).then((pr) =>
          setPredictions((prev) => ({ ...prev, [c.id]: pr }))
        );
      });
    });
  }, [id]);

  if (!parcel) return <Spinner />;

  const addCrop = async () => {
    await api.post<Crop>(`/api/parcels/${id}/crops`, newCrop);
    setShowAdd(false);
    const p = await api.get<Parcel>(`/api/parcels/${id}`);
    setParcel(p);
    p.crops?.forEach((c) => {
      api.get<Prediction>(`/api/predictions/${c.id}`).then((pr) =>
        setPredictions((prev) => ({ ...prev, [c.id]: pr }))
      );
    });
  };

  const removeParcel = async () => {
    if (!confirm('Supprimer définitivement cette parcelle et ses cultures ?')) return;
    await api.del(`/api/parcels/${id}`);
    navigate('/parcels');
  };

  const info = [
    { l: 'Région', v: parcel.region || '—' },
    { l: 'Superficie', v: `${formatNumber(parcel.area_ha)} ha` },
    { l: 'Type de sol', v: parcel.soil_type || '—' },
    { l: 'Irrigation', v: parcel.irrigation || '—' },
    { l: 'Coordonnées', v: `${parcel.lat.toFixed(3)}, ${parcel.lon.toFixed(3)}` }
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/parcels" className="text-sm text-gray-400 hover:text-gray-600">← Retour aux parcelles</Link>
          <h1 className="mt-1 font-heading text-2xl font-bold text-gray-900">{parcel.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/parcels/${id}/edit`} className="btn-secondary">✏️ Modifier</Link>
          <button onClick={removeParcel} className="btn-ghost text-danger hover:bg-red-50">🗑️ Supprimer</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {info.map((i) => (
          <div key={i.l} className="card p-4">
            <p className="text-xs text-gray-400">{i.l}</p>
            <p className="mt-1 font-heading text-sm font-semibold text-gray-800">{i.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-gray-900">Cultures & prévisions</h2>
        <button onClick={() => setShowAdd((s) => !s)} className="btn-secondary">
          + Ajouter une culture
        </button>
      </div>

      {showAdd && (
        <div className="card mt-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Culture</label>
              <select className="input" value={newCrop.crop_type} onChange={(e) => setNewCrop((c) => ({ ...c, crop_type: e.target.value }))}>
                {CROP_TYPES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Variété</label>
              <input className="input" value={newCrop.variety} onChange={(e) => setNewCrop((c) => ({ ...c, variety: e.target.value }))} placeholder="Optionnel" />
            </div>
            <div>
              <label className="label">Date de semis</label>
              <input className="input" type="date" value={newCrop.sowing_date} onChange={(e) => setNewCrop((c) => ({ ...c, sowing_date: e.target.value }))} />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="btn-primary" onClick={addCrop}>Enregistrer</button>
            <button className="btn-ghost" onClick={() => setShowAdd(false)}>Annuler</button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-4">
        {(parcel.crops || []).map((c) => {
          const pr = predictions[c.id];
          return (
            <div key={c.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cropIcon(c.crop_type)}</span>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-gray-900">{c.crop_type}</h3>
                    <p className="text-xs text-gray-400">
                      {c.variety || 'Variété non précisée'} · semis {c.sowing_date || '—'} · stade <span className="capitalize">{c.stage || '—'}</span>
                    </p>
                  </div>
                </div>
                {pr && (
                  <div className="text-right">
                    <p className="font-heading text-xl font-bold text-primary-dark">{formatNumber(pr.yield_med)} {pr.unit}</p>
                    <p className="text-[11px] text-gray-400">rendement médian prévu</p>
                  </div>
                )}
              </div>

              {pr ? (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-400">Scénario optimiste</p>
                    <p className="font-semibold text-green-700">{formatNumber(pr.scenarios.optimiste)} {pr.unit}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-400">Scénario médian</p>
                    <p className="font-semibold text-gray-800">{formatNumber(pr.scenarios.median)} {pr.unit}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-400">Scénario pessimiste</p>
                    <p className="font-semibold text-red-600">{formatNumber(pr.scenarios.pessimiste)} {pr.unit}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-400">Calcul de la prévision…</p>
              )}

              <div className="mt-4">
                <Link to={`/predictions?crop=${c.id}`} className="text-sm font-medium text-primary hover:underline">
                  Voir la prévision détaillée →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
