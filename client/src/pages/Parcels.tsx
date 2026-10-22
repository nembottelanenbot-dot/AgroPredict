import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Parcel } from '../types';
import { Spinner, EmptyState, PageHeader, cropIcon, formatNumber } from '../components/ui';
import CameroonMap from '../components/CameroonMap';

export default function Parcels() {
  const [parcels, setParcels] = useState<Parcel[] | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get<Parcel[]>('/api/parcels').then(setParcels).catch(() => setParcels([]));
  }, []);

  if (!parcels) return <Spinner />;

  const byRegion = parcels.reduce<Record<string, number>>((acc, p) => {
    acc[p.region || 'Centre'] = (acc[p.region || 'Centre'] || 0) + (p.area_ha || 0);
    return acc;
  }, {});
  const mapData = Object.entries(byRegion).map(([region, value]) => ({ region, value }));

  const filtered = parcels.filter(
    (p) =>
      !filter ||
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      (p.region || '').toLowerCase().includes(filter.toLowerCase()) ||
      (p.crops || []).some((c) => c.crop_type.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div>
      <PageHeader
        title="Mes parcelles"
        subtitle={`${parcels.length} parcelle(s) enregistrée(s)`}
        action={
          <Link to="/parcels/new" className="btn-primary">
            + Ajouter une parcelle
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-1">
          <h3 className="mb-2 px-1 font-heading text-sm font-semibold text-gray-700">Répartition par région</h3>
          <CameroonMap data={mapData} />
          <p className="mt-2 px-1 text-[11px] text-gray-400">Superficie cultivée (ha) par région pilote.</p>
        </div>

        <div className="lg:col-span-2">
          <input
            className="input mb-4"
            placeholder="🔍 Rechercher une parcelle, une culture ou une région…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filtered.length === 0 ? (
            <EmptyState title="Aucune parcelle trouvée" hint="Ajoutez votre première parcelle pour obtenir des prévisions de rendement." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filtered.map((p) => (
                <Link key={p.id} to={`/parcels/${p.id}`} className="card block p-5 transition hover:border-primary/40 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading text-base font-semibold text-gray-900">{p.name}</h3>
                      <p className="mt-0.5 text-xs text-gray-400">
                        📍 {p.region} · {formatNumber(p.area_ha)} ha · sol {p.soil_type}
                      </p>
                    </div>
                    <span className="badge bg-primary-light text-primary-dark">{p.irrigation}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(p.crops || []).map((c) => (
                      <span key={c.id} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {cropIcon(c.crop_type)} {c.crop_type}
                      </span>
                    ))}
                    {(p.crops || []).length === 0 && (
                      <span className="text-xs text-gray-400">Aucune culture enregistrée</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
