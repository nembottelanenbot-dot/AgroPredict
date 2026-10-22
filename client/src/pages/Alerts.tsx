import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Alert } from '../types';
import { Spinner, EmptyState, PageHeader, SeverityBadge, StatusBadge } from '../components/ui';

const TYPE_LABELS: Record<string, string> = {
  'sécheresse': 'Sécheresse imminente',
  'excès_pluvio': 'Excès pluviométrique',
  'gel': 'Risque de gel',
  'anomalie_ndvi': 'Anomalie NDVI',
  'phytosanitaire': 'Risque phytosanitaire',
  'rappel': 'Rappel d\'intervention',
  'maj_prevision': 'Mise à jour de prévision',
  'stade_critique': 'Stade phénologique critique'
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [filter, setFilter] = useState('toutes');

  const load = () => api.get<Alert[]>('/api/alerts').then(setAlerts);

  useEffect(() => {
    load();
  }, []);

  if (!alerts) return <Spinner />;

  const ack = async (id: number) => {
    await api.post(`/api/alerts/${id}/ack`);
    load();
  };

  const filtered = alerts.filter((a) => filter === 'toutes' || a.status === filter);

  return (
    <div>
      <PageHeader
        title="Centre d'alertes"
        subtitle="Alertes météo, phytosanitaires et rappels d'intervention."
        action={
          <div className="flex gap-2">
            {['toutes', 'active', 'acknowledged'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-xl px-3 py-2 text-sm font-medium capitalize transition ${
                  filter === f ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f === 'toutes' ? 'Toutes' : f === 'active' ? 'Actives' : 'Traitées'}
              </button>
            ))}
          </div>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState title="Aucune alerte" hint="Vous êtes à jour — aucune alerte dans cette catégorie." />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className={`card p-5 ${a.status === 'acknowledged' ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-xl">{a.severity === 'critique' ? '🚨' : a.severity === 'haute' ? '⚠️' : 'ℹ️'}</span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-sm font-semibold text-gray-900">{TYPE_LABELS[a.type] || a.type}</h3>
                      <SeverityBadge severity={a.severity} />
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="mt-1.5 text-sm text-gray-700">{a.message}</p>
                    {a.recommendation && (
                      <p className="mt-1.5 text-sm text-gray-500">💡 {a.recommendation}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      {a.parcel_name ? `Parcelle : ${a.parcel_name} · ` : ''}
                      {new Date(a.triggered_at + 'Z').toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                {a.status === 'active' && (
                  <button onClick={() => ack(a.id)} className="btn-secondary shrink-0">
                    ✓ Marquer traitée
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
