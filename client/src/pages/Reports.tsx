import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Report } from '../types';
import { Spinner, EmptyState, PageHeader } from '../components/ui';

const REPORT_TYPES = [
  'Rapport individuel de campagne',
  'Rapport coopérative mensuel',
  'Bulletin régional hebdomadaire',
  'Rapport national de suivi',
  'Export brut pour analyse'
];

export default function Reports() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [type, setType] = useState(REPORT_TYPES[0]);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => api.get<Report[]>('/api/reports').then(setReports);

  useEffect(() => {
    load();
  }, []);

  const generate = async () => {
    setGenerating(true);
    setMessage('');
    try {
      await api.post('/api/reports/generate', { type });
      setMessage('✅ Rapport généré avec succès (simulation PDF).');
      load();
    } catch (e) {
      setMessage('❌ ' + (e instanceof Error ? e.message : 'Erreur'));
    } finally {
      setGenerating(false);
    }
  };

  if (!reports) return <Spinner />;

  return (
    <div>
      <PageHeader title="Rapports & exports" subtitle="Générez et téléchargez vos rapports PDF / Excel / CSV." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <h3 className="font-heading text-base font-semibold text-gray-900">Générer un rapport</h3>
          <div className="mt-4">
            <label className="label">Type de rapport</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button className="btn-primary mt-4 w-full" onClick={generate} disabled={generating}>
            {generating ? 'Génération…' : '⚙️ Générer le rapport'}
          </button>
          {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
          <p className="mt-4 text-xs text-gray-400">
            Formats disponibles : PDF, Excel, CSV. La génération réelle est simulée dans cette version de démonstration.
          </p>
        </div>

        <div className="lg:col-span-2">
          <h3 className="mb-3 font-heading text-base font-semibold text-gray-900">Historique des rapports</h3>
          {reports.length === 0 ? (
            <EmptyState title="Aucun rapport" hint="Générez votre premier rapport pour le retrouver ici." />
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="card flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-lg">📄</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold text-gray-900">{r.type}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.generated_at + 'Z').toLocaleString('fr-FR')} · {r.format}
                    </p>
                  </div>
                  <button className="btn-ghost shrink-0">⬇️ Télécharger</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
