import { useAuth, ROLE_LABELS } from '../auth';
import { PageHeader } from '../components/ui';

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const rows = [
    { l: 'Nom complet', v: user.name },
    { l: 'Email', v: user.email },
    { l: 'Téléphone', v: user.phone || '—' },
    { l: 'Profil', v: ROLE_LABELS[user.role] },
    { l: 'Région', v: user.region || '—' }
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Mon profil" subtitle="Informations personnelles et préférences du compte." />
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {rows.map((r) => (
            <div key={r.l} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">{r.l}</span>
              <span className="text-sm font-semibold text-gray-800">{r.v}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-gray-100 p-4 text-xs leading-relaxed text-gray-500">
          🔒 Conformément au cahier des charges (section 12), vous disposez d'un droit d'accès, de
          rectification, d'effacement et de portabilité sur vos données personnelles. Les coordonnées
          GPS de vos parcelles et vos données agronomiques sont conservées de façon sécurisée.
        </div>
      </div>
    </div>
  );
}
