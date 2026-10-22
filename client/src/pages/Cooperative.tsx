import { useEffect, useState } from 'react';
import { api } from '../api';
import type { DashboardStats } from '../types';
import { Spinner, PageHeader, StatCard, formatNumber, cropIcon } from '../components/ui';

export default function Cooperative() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.get<DashboardStats>('/api/stats/dashboard').then(setStats);
  }, []);

  if (!stats) return <Spinner />;

  const members = stats.crops.map((c) => c.parcel_name).filter((v, i, a) => a.indexOf(v) === i);

  const ranking = stats.crops
    .map((c) => ({ name: c.parcel_name, crop: c.crop_type, production: c.yield_med * c.area_ha }))
    .sort((a, b) => b.production - a.production);

  return (
    <div>
      <PageHeader title="Tableau de bord coopérative" subtitle="Vue agrégée des parcelles des membres et prévision de production." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Membres / parcelles" value={members.length} sub="exploitations suivies" icon="🤝" />
        <StatCard label="Superficie agrégée" value={`${formatNumber(stats.total_area)} ha`} icon="📐" accent="#E3F2FD" />
        <StatCard label="Production totale estimée" value={`${formatNumber(stats.estimated_production)} t`} icon="📦" accent="#E8F5E9" />
        <StatCard label="Alertes actives" value={stats.active_alerts} icon="🔔" accent="#FFF3E0" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 font-heading text-base font-semibold text-gray-900">Classement des membres par performance prédite</h3>
          <div className="space-y-2">
            {ranking.map((r, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-2.5">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {i + 1}
                </span>
                <span className="text-lg">{cropIcon(r.crop)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.crop}</p>
                </div>
                <p className="text-sm font-bold text-primary-dark">{formatNumber(r.production)} t</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-heading text-base font-semibold text-gray-900">Prévision de production par culture</h3>
          <div className="space-y-3">
            {Object.entries(
              stats.crops.reduce<Record<string, number>>((acc, c) => {
                acc[c.crop_type] = (acc[c.crop_type] || 0) + c.yield_med * c.area_ha;
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .map(([crop, prod]) => (
                <div key={crop}>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{cropIcon(crop)} {crop}</span>
                    <span className="font-semibold text-gray-800">{formatNumber(prod)} t</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.min(100, (prod / stats.estimated_production) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-6 rounded-xl bg-primary-light p-4 text-xs text-gray-600">
            📤 Exportez ces prévisions (PDF/Excel) depuis la page <b>Rapports</b> pour planifier la
            logistique (transport, stockage).
          </div>
        </div>
      </div>
    </div>
  );
}
