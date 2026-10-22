import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../auth';
import type { Role } from '../types';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  roles?: Role[];
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: '/', label: 'Tableau de bord', icon: '📊', end: true },
  { to: '/weather', label: 'Météo', icon: '🌦️' },
  { to: '/parcels', label: 'Mes parcelles', icon: '🗺️' },
  { to: '/predictions', label: 'Prévisions', icon: '📈' },
  { to: '/alerts', label: 'Alertes', icon: '🔔' },
  { to: '/reports', label: 'Rapports', icon: '📄' },
  {
    to: '/map',
    label: 'Carte nationale',
    icon: '🌍',
    roles: ['analyste', 'admin_regional', 'super_admin'],
  },
  {
    to: '/cooperative',
    label: 'Coopérative',
    icon: '🤝',
    roles: ['chef_cooperative'],
  },
  {
    to: '/admin',
    label: 'Administration',
    icon: '⚙️',
    roles: ['admin_regional', 'super_admin'],
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const isDark = theme === 'dark';
  const items = NAV.filter(
    (i) => !i.roles || (user && i.roles.includes(user.role))
  );

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((i) => (
        <NavLink
          key={i.to}
          to={i.to}
          end={i.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? isDark
                  ? 'bg-[#86efac] text-[#0f1512] shadow-sm'
                  : 'bg-primary text-white shadow-sm'
                : isDark
                  ? 'text-[#E5E7EB] hover:bg-[#1f2a26] hover:text-[#F3F4F6]'
                  : 'text-[#374151] hover:bg-primary-light hover:text-[#111827]'
            }`
          }
        >
          <span className="text-base">{i.icon}</span>
          <span>{i.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  const sidebarInner = (
    <div
      className={`flex h-full flex-col ${isDark ? 'bg-[#0f1512] text-[#e5e7eb]' : 'bg-white text-[#111827]'}`}
    >
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${isDark ? 'bg-[#86efac] text-[#0b130e]' : 'bg-primary text-white'}`}
        >
          🌾
        </div>
        <div>
          <p
            className={`font-heading text-base font-bold leading-tight ${isDark ? 'text-[#86efac]' : 'text-[#1B5E20]'}`}
          >
            AgroPredict
          </p>
          <p
            className={`text-[10px] font-medium uppercase tracking-wide ${isDark ? 'text-[#D1D5DB]' : 'text-[#4B5563]'}`}
          >
            IA au service de l'agriculture
          </p>
        </div>
      </div>
      {nav}
      <div className="p-3">
        <div
          className={`rounded-xl p-3 ${isDark ? 'bg-[#161e1b] text-[#d1d5db]' : 'bg-primary-light text-[#374151]'}`}
        >
          <p
            className={`text-xs font-semibold ${isDark ? 'text-[#86efac]' : 'text-[#1B5E20]'}`}
          >
            💡 Conseil du jour
          </p>
          <p
            className={`mt-1 text-[11px] leading-relaxed ${isDark ? 'text-[#D1D5DB]' : 'text-[#374151]'}`}
          >
            Consultez vos alertes avant d'arroser — la météo annonce une
            sécheresse possible.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen ${isDark ? 'theme-dark bg-[#0f1512] text-[#e5e7eb]' : 'theme-light bg-[#fafafa] text-[#111827]'}`}
    >
      {/* Sidebar desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden w-64 border-r lg:block ${isDark ? 'border-[#232f2a] bg-[#0f1512]' : 'border-gray-100 bg-white'}`}
      >
        {sidebarInner}
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside
            className={`absolute inset-y-0 left-0 w-64 shadow-xl ${isDark ? 'bg-[#0f1512]' : 'bg-white'}`}
          >
            {sidebarInner}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header
          className={`sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 backdrop-blur lg:px-8 ${isDark ? 'border-[#232f2a] bg-[#0f1512]/80' : 'border-gray-100 bg-white/80'}`}
        >
          <div className="flex items-center gap-3">
            <button
              className={`flex h-9 w-9 items-center justify-center rounded-lg border lg:hidden ${isDark ? 'border-[#232f2a] text-[#e5e7eb]' : 'border-gray-200 text-gray-600'}`}
              onClick={() => setOpen(true)}
            >
              ☰
            </button>
            <div
              className={`hidden items-center gap-2 text-sm sm:flex ${isDark ? 'text-[#D1D5DB]' : 'text-[#374151]'}`}
            >
              <span>📍</span>
              <span>{user?.region ? `Région ${user.region}` : 'Cameroun'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${isDark ? 'border-[#232f2a] bg-[#161e1b] text-[#F3F4F6]' : 'border-gray-200 bg-white text-[#111827]'}`}
            >
              {isDark ? 'Couleur initiale' : 'Thème sombre'}
            </button>
            <button
              onClick={() => navigate('/alerts')}
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg border ${isDark ? 'border-[#232f2a] text-[#F3F4F6] hover:bg-[#1f2a26]' : 'border-gray-200 text-[#374151] hover:bg-gray-50'}`}
            >
              🔔
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${isDark ? 'bg-[#86efac] text-[#0f1512]' : 'bg-primary text-white'}`}
              >
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <p
                  className={`text-sm font-semibold leading-tight ${isDark ? 'text-[#F3F4F6]' : 'text-[#111827]'}`}
                >
                  {user?.name}
                </p>
                <p
                  className={`text-xs ${isDark ? 'text-[#D1D5DB]' : 'text-[#4B5563]'}`}
                >
                  {user ? ROLE_LABELS[user.role] : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className={`ml-1 rounded-lg px-2 py-1.5 text-sm ${isDark ? 'text-[#D1D5DB] hover:bg-[#1f2a26] hover:text-[#F3F4F6]' : 'text-[#4B5563] hover:bg-gray-100 hover:text-[#111827]'}`}
                title="Déconnexion"
              >
                ⎋
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </main>

        <footer
          className={`border-t py-6 text-center text-xs ${isDark ? 'border-[#232f2a] text-[#D1D5DB]' : 'border-gray-100 text-[#4B5563]'}`}
        >
          AgroPredict — Plateforme intelligente de prévision des rendements
          agricoles · CDC-AGROPREDICT-2026-V2.0
        </footer>
      </div>
    </div>
  );
}
