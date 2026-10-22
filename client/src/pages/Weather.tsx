import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';
import type { WeatherDay } from '../types';
import { Spinner, PageHeader } from '../components/ui';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const REGIONS = ['Centre', 'Littoral', 'Ouest', 'Nord', 'Extrême-Nord'];

function icon(d: WeatherDay) {
  return d.icon === 'pluie' ? '🌧️' : d.icon === 'averse' ? '🌦️' : d.icon === 'nuageux' ? '☁️' : '☀️';
}

export default function Weather() {
  const { user } = useAuth();
  const [region, setRegion] = useState(user?.region || 'Centre');
  const [data, setData] = useState<WeatherDay[] | null>(null);

  useEffect(() => {
    setData(null);
    api.get<{ forecast: WeatherDay[] }>(`/api/weather/${region}`).then((r) => setData(r.forecast)).catch(() => {});
  }, [region]);

  return (
    <div>
      <PageHeader
        title="Prévisions météo"
        subtitle="Données sur 10 jours — précipitations, températures, humidité et alertes gel."
        action={
          <select className="input w-48" value={region} onChange={(e) => setRegion(e.target.value)}>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        }
      />

      {!data ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {data.map((d) => (
              <div key={d.date} className="card flex flex-col items-center p-4">
                <p className="text-xs font-semibold text-gray-500">{d.day}</p>
                <p className="text-[11px] text-gray-400">{d.date.slice(8, 10)}/{d.date.slice(5, 7)}</p>
                <span className="my-2 text-3xl">{icon(d)}</span>
                <p className="font-heading text-base font-bold text-gray-900">{Math.round(d.temp_max)}°</p>
                <p className="text-xs text-gray-400">{Math.round(d.temp_min)}° min</p>
                <p className="mt-1 text-[11px] font-medium text-blue-600">💧 {d.precipitation} mm</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-4 font-heading text-base font-semibold text-gray-900">Températures (°C)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(0, 3)} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="temp_max" name="Max" stroke="#C62828" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="temp_min" name="Min" stroke="#1565C0" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card p-5">
              <h3 className="mb-4 font-heading text-base font-semibold text-gray-900">Précipitations (mm/jour)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(0, 3)} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="precipitation" name="Précipitations" stroke="#2E7D32" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { l: 'Humidité moyenne', v: `${Math.round(data.reduce((s, d) => s + d.humidity, 0) / data.length)} %`, i: '💧' },
              { l: 'Vent moyen', v: `${Math.round(data.reduce((s, d) => s + d.wind, 0) / data.length)} km/h`, i: '🌬️' },
              { l: 'Indice UV max', v: `${Math.max(...data.map((d) => d.uv))}`, i: '☀️' },
              { l: 'Risque de gel', v: data.some((d) => d.risk_frost === 'élevé') ? 'Élevé ⚠️' : 'Faible', i: '❄️' }
            ].map((s) => (
              <div key={s.l} className="card flex items-center gap-3 p-4">
                <span className="text-2xl">{s.i}</span>
                <div>
                  <p className="text-xs text-gray-500">{s.l}</p>
                  <p className="font-heading text-base font-bold text-gray-900">{s.v}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
