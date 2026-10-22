import { ReactNode } from 'react';

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  accent?: string;
}) {
  return (
    <div className="card flex items-start gap-4 p-5">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: accent || '#F1F8E9', color: '#1B5E20' }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 font-heading text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex h-40 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-light border-t-primary" />
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-2xl">🌾</div>
      <p className="font-heading text-sm font-semibold text-gray-700">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const SEVERITY_STYLES: Record<string, string> = {
  critique: 'bg-red-100 text-red-700',
  haute: 'bg-orange-100 text-orange-700',
  moyenne: 'bg-amber-100 text-amber-700',
  basse: 'bg-gray-100 text-gray-600'
};

const SEVERITY_LABELS: Record<string, string> = {
  critique: 'Critique',
  haute: 'Haute',
  moyenne: 'Moyenne',
  basse: 'Basse'
};

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span className={`badge ${SEVERITY_STYLES[severity] || 'bg-gray-100 text-gray-600'}`}>
      {SEVERITY_LABELS[severity] || severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active: { cls: 'bg-red-100 text-red-700', label: 'Active' },
    acknowledged: { cls: 'bg-gray-100 text-gray-500', label: 'Traitée' },
    en_cours: { cls: 'bg-green-100 text-green-700', label: 'En cours' }
  };
  const s = map[status] || { cls: 'bg-gray-100 text-gray-600', label: status };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export function formatNumber(n: number, digits = 1): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: digits }).format(n);
}

export const CROP_ICONS: Record<string, string> = {
  'Maïs': '🌽',
  'Riz': '🌾',
  'Sorgho': '🌾',
  'Mil': '🌾',
  'Manioc': '🥔',
  'Igname': '🥔',
  'Patate douce': '🍠',
  'Arachide': '🥜',
  'Haricot': '🫘',
  'Niébé': '🫘',
  'Cacao': '🍫',
  'Café': '☕',
  'Coton': '🧵',
  'Tomate': '🍅',
  'Oignon': '🧅',
  'Poivron': '🫑'
};

export function cropIcon(type: string): string {
  return CROP_ICONS[type] || '🌱';
}
