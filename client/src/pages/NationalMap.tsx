import { useEffect, useState } from 'react';
import { api } from '../api';
import type { RegionalStat } from '../types';
import { Spinner, PageHeader, formatNumber, cropIcon } from '../components/ui';
import CameroonMap from '../components/CameroonMap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function NationalMap() {
  const [stats, setStats] = useState<RegionalStat[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    api.get<RegionalStat[]>('/api/stats/national').then(setStats);
  }, []);

  if (!stats) return <Spinner />;

  const mapData = stats.map((s) => ({ region: s.region, value: Math.round(s.production), label: `${Math.round(s.production).toLocaleString('fr-FR')} t` }));
  const selectedStat = stats.find((s) => s.region === selected);

  const topCrops = Object.entries(
    stats.reduce<Record<string, number>>((acc, s) => {
      Object.entries(s.crops).forEach(([k, v]) => (acc[k] = (acc[k] || 0) + v));
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, production: Math.round(value) }))
    .sort((a, b) => b.production - a.production)
    .slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Carte nationale des rendements"
        subtitle="Chaleur des rendements prévisionnels par région — vue Analyste / Décideur."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-1">
          <h3 className="mb-3 font-heading text-base font-semibold text-gray-900">Production estimée par région</h3>
          <CameroonMap data={mapData} selected={selected} onSelect={setSelected} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <button
                key={s.region}
                onClick={() => setSelected(s.region === selected ? null : s.region)}
                className={`card p-4 text-left transition ${selected === s.region ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
              >
                <p className="text-xs text-gray-400">{s.region}</p>
                <p className="mt-1 font-heading text-lg font-bold text-gray-900">{Math.round(s.production)} <span className="text-xs font-normal text-gray-400">t</span></p>
                <p className="text-[11px] text-gray-400">{s.parcels} parcelle(s) · {formatNumber(s.area)} ha</p>
              </button>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="mb-4 font-heading text-base font-semibold text-gray-900">Top cultures nationales</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCrops} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip formatter={(v: number) => [`${v} t`, 'Production']} />
                  <Bar dataKey="production" fill="#FF8F00" radius={[0, 6, 6, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {selectedStat && (
            <div className="card p-5">
              <h3 className="mb-3 font-heading text-base font-semibold text-gray-900">Détail — {selectedStat.region}</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {Object.entries(selectedStat.crops).map(([crop, prod]) => (
                  <div key={crop} className="flex items-center gap-2 rounded-xl bg-gray-50 p-3">
                    <span className="text-xl">{cropIcon(crop)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{crop}</p>
                      <p className="text-xs text-gray-400">{Math.round(prod)} t estimées</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
