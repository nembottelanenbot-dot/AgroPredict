import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import type { DashboardStats, Alert, WeatherDay } from '../types';
import { StatCard, Spinner, SeverityBadge, formatNumber, cropIcon } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [weather, setWeather] = useState<WeatherDay[]>([]);

  useEffect(() => {
    api.get<DashboardStats>('/api/stats/dashboard').then(setStats).catch(() => {});
    api.get<Alert[]>('/api/alerts').then((a) => setAlerts(a.filter((x) => x.status === 'active'))).catch(() => {});
    api.get<{ forecast: WeatherDay[] }>(`/api/weather/${user?.region || 'Centre'}`).then((r) => setWeather(r.forecast.slice(0, 5))).catch(() => {});
  }, [user?.region]);

  if (!stats) return <Spinner />;

  const productionByCrop = stats.crops.reduce<Record<string, number>>((acc, c) => {
    acc[c.crop_type] = (acc[c.crop_type] || 0) + c.yield_med * c.area_ha;
    return acc;
  }, {});
  const chartData = Object.entries(productionByCrop)
    .map(([name, value]) => ({ name, production: Math.round(value * 10) / 10 }))
    .sort((a, b) => b.production - a.production)
    .slice(0, 6);

  const today = weather[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Bonjour, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Voici l'état de votre exploitation au {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Parcelles" value={stats.parcels_count} sub="surfaces suivies" icon="🗺️" />
        <StatCard label="Cultures en cours" value={stats.crops_count} sub="toutes parcelles" icon="🌱" accent="#FFF3E0" />
        <StatCard label="Superficie totale" value={`${formatNumber(stats.total_area)} ha`} sub="zone cultivée" icon="📐" accent="#E3F2FD" />
        <StatCard
          label="Production estimée"
          value={`${formatNumber(stats.estimated_production)} t`}
          sub="rendement prévu"
          icon="📈"
          accent="#E8F5E9"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Prévision de production */}
        <div className="card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-gray-900">Production estimée par culture</h2>
            <Link to="/predictions" className="text-sm font-medium text-primary hover:underline">
              Voir tout →
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`${v} t`, 'Production']} />
                <Bar dataKey="production" fill="#2E7D32" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Météo du jour */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-gray-900">Météo — {user?.region || 'Cameroun'}</h2>
            <Link to="/weather" className="text-sm font-medium text-primary hover:underline">
              Détails →
            </Link>
          </div>
          {today ? (
            <div className="flex items-center gap-4">
              <div className="text-5xl">{today.icon === 'pluie' ? '🌧️' : today.icon === 'averse' ? '🌦️' : today.icon === 'nuageux' ? '☁️' : '☀️'}</div>
              <div>
                <p className="font-heading text-2xl font-bold text-gray-900">{today.temp_max}°C</p>
                <p className="text-sm text-gray-500">min {today.temp_min}°C · 💧 {today.precipitation} mm</p>
              </div>
            </div>
          ) : (
            <Spinner />
          )}
          <div className="mt-4 grid grid-cols-5 gap-1">
            {weather.map((w, i) => (
              <div key={i} className="flex flex-col items-center rounded-lg bg-gray-50 py-2">
                <span className="text-[10px] text-gray-400">{w.day.slice(0, 3)}</span>
                <span className="my-1 text-lg">{w.icon === 'pluie' ? '🌧️' : w.icon === 'averse' ? '🌦️' : w.icon === 'nuageux' ? '☁️' : '☀️'}</span>
                <span className="text-[11px] font-semibold text-gray-700">{Math.round(w.temp_max)}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertes + Parcelles */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-gray-900">Alertes actives</h2>
            <Link to="/alerts" className="text-sm font-medium text-primary hover:underline">
              Tout voir →
            </Link>
          </div>
          {alerts.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">Aucune alerte active. 👍</p>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-xl border border-gray-100 p-3">
                  <span className="text-lg">⚠️</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={a.severity} />
                      {a.parcel_name && <span className="truncate text-xs text-gray-400">{a.parcel_name}</span>}
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{a.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-gray-900">Mes parcelles</h2>
            <Link to="/parcels" className="text-sm font-medium text-primary hover:underline">
              Gérer →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.crops.slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                <span className="text-xl">{cropIcon(c.crop_type)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{c.parcel_name}</p>
                  <p className="text-xs text-gray-400">
                    {c.crop_type} · {formatNumber(c.area_ha)} ha · {c.region}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary-dark">{formatNumber(c.yield_med)} {c.unit.replace('/ha', '/ha')}</p>
                  <p className="text-[11px] text-gray-400">prévision</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
