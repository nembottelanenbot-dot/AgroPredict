import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import type { Prediction } from '../types';
import { Spinner, EmptyState, PageHeader, cropIcon, formatNumber } from '../components/ui';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Area } from 'recharts';

interface Row extends Prediction {
  parcel_name: string;
  region: string;
  area_ha: number;
  parcel_id: number;
}

export default function Predictions() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [params] = useSearchParams();
  const cropId = params.get('crop');
  const [detail, setDetail] = useState<Row | null>(null);

  useEffect(() => {
    api.get<Row[]>('/api/predictions').then((r) => {
      setRows(r);
      if (cropId) {
        const found = r.find((x) => x.crop_id === Number(cropId));
        if (found) setDetail(found);
      }
    });
  }, [cropId]);

  if (!rows) return <Spinner />;
  if (rows.length === 0) return <EmptyState title="Aucune prévision disponible" hint="Ajoutez une parcelle et une culture pour générer des prévisions." />;

  const chartData = detail
    ? detail.predictions.map((p) => ({
        horizon: p.horizon_label,
        médian: p.yield_med,
        optimiste: p.scenario_opt,
        pessimiste: p.scenario_pes
      }))
    : [];

  return (
    <div>
      <PageHeader title="Prévisions de rendement" subtitle="Modèles ML par culture — intervalles de confiance, scénarios et recommandations." />

      {detail ? (
        <div>
          <button onClick={() => setDetail(null)} className="mb-4 text-sm text-gray-400 hover:text-gray-600">
            ← Toutes les prévisions
          </button>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{cropIcon(detail.crop_type)}</span>
                <div>
                  <h2 className="font-heading text-xl font-bold text-gray-900">
                    {detail.crop_type} — {detail.parcel_name}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {detail.region} · {formatNumber(detail.area_ha)} ha · stade <span className="capitalize">{detail.stage}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-primary-light p-4 text-center">
                  <p className="text-xs text-gray-500">Optimiste (décile 80)</p>
                  <p className="font-heading text-lg font-bold text-primary-dark">{formatNumber(detail.scenarios.optimiste)} {detail.unit}</p>
                </div>
                <div className="rounded-xl bg-primary p-4 text-center text-white">
                  <p className="text-xs text-white/70">Médian (décile 50)</p>
                  <p className="font-heading text-xl font-bold">{formatNumber(detail.scenarios.median)} {detail.unit}</p>
                </div>
                <div className="rounded-xl bg-accent-light p-4 text-center">
                  <p className="text-xs text-gray-500">Pessimiste (décile 20)</p>
                  <p className="font-heading text-lg font-bold text-accent">{formatNumber(detail.scenarios.pessimiste)} {detail.unit}</p>
                </div>
              </div>

              <h3 className="mb-3 mt-8 font-heading text-base font-semibold text-gray-900">Évolution par horizon de prévision</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="horizon" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="pessimiste" name="Pessimiste" stroke="none" fill="#FFE0B2" />
                    <Area type="monotone" dataKey="optimiste" name="Optimiste" stroke="none" fill="#C8E6C9" />
                    <Bar dataKey="médian" name="Rendement médian" fill="#2E7D32" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    <Line type="monotone" dataKey="médian" name="Tendance" stroke="#1B5E20" strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 p-4">
                  <h4 className="text-sm font-semibold text-gray-700">Comparaison historique</h4>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Moyenne locale</span><span className="font-semibold">{formatNumber(detail.historical.local_avg)} {detail.unit}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Référence nationale</span><span className="font-semibold">{formatNumber(detail.historical.national_ref)} {detail.unit}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Campagne précédente</span><span className="font-semibold">{formatNumber(detail.historical.last_campaign)} {detail.unit}</span></div>
                    <div className="flex justify-between border-t border-gray-100 pt-2"><span className="text-gray-700 font-medium">Prévision actuelle</span><span className="font-bold text-primary-dark">{formatNumber(detail.yield_med)} {detail.unit}</span></div>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 p-4">
                  <h4 className="text-sm font-semibold text-gray-700">Contribution des facteurs</h4>
                  <div className="mt-3 space-y-2.5">
                    {Object.entries(detail.factors).map(([k, v]) => (
                      <div key={k}>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{k}</span>
                          <span className={v < 0 ? 'text-red-600' : 'text-green-700'}>{v > 0 ? '+' : ''}{v}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                          <div
                            className={`h-1.5 rounded-full ${v < 0 ? 'bg-red-400' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(100, Math.abs(v) * 6)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="card p-5">
                <h4 className="font-heading text-base font-semibold text-gray-900">Recommandations</h4>
                <ul className="mt-3 space-y-2.5">
                  {detail.recommendation.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600">
                      <span className="text-primary">✓</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-5">
                <h4 className="font-heading text-base font-semibold text-gray-900">Qualité du modèle</h4>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Précision (1 − MAPE)</span><span className="font-semibold text-green-700">{formatNumber(100 - detail.mape, 1)} %</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">MAPE</span><span className="font-semibold">{formatNumber(detail.mape, 1)} %</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Intervalle 80 %</span><span className="font-semibold">{formatNumber(detail.confidence_80.low)} – {formatNumber(detail.confidence_80.high)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Intervalle 95 %</span><span className="font-semibold">{formatNumber(detail.confidence_95.low)} – {formatNumber(detail.confidence_95.high)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <button
              key={r.crop_id}
              onClick={() => setDetail(r)}
              className="card flex w-full items-center gap-4 p-4 text-left transition hover:border-primary/40 hover:shadow-md"
            >
              <span className="text-3xl">{cropIcon(r.crop_type)}</span>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm font-semibold text-gray-900">
                  {r.crop_type} · {r.parcel_name}
                </p>
                <p className="text-xs text-gray-400">
                  {r.region} · {formatNumber(r.area_ha)} ha · <span className="capitalize">{r.stage}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-heading text-lg font-bold text-primary-dark">{formatNumber(r.yield_med)} {r.unit}</p>
                <p className="text-[11px] text-gray-400">prévision médiane</p>
              </div>
              <span className="text-gray-300">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
