import { useEffect, useState } from 'react';
import { api } from '../api';
import type { User, MlModel } from '../types';
import { Spinner, PageHeader, formatNumber } from '../components/ui';
import { ROLE_LABELS } from '../auth';

const REGIONS = ['Centre', 'Littoral', 'Ouest', 'Nord', 'Extrême-Nord'];
const ALL_ROLES = Object.keys(ROLE_LABELS);

export default function Admin() {
  const [tab, setTab] = useState<'users' | 'models'>('users');
  const [users, setUsers] = useState<User[] | null>(null);
  const [models, setModels] = useState<MlModel[] | null>(null);

  const loadUsers = () => api.get<User[]>('/api/users').then(setUsers);
  const loadModels = () => api.get<MlModel[]>('/api/models').then(setModels);

  useEffect(() => {
    loadUsers();
    loadModels();
  }, []);

  const updateUser = async (id: number, patch: Partial<User>) => {
    await api.patch(`/api/users/${id}`, patch);
    loadUsers();
  };

  return (
    <div>
      <PageHeader title="Administration" subtitle="Gestion des utilisateurs et configuration des modèles ML." />

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTab('users')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${tab === 'users' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
        >
          👥 Utilisateurs
        </button>
        <button
          onClick={() => setTab('models')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${tab === 'models' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
        >
          🧠 Modèles ML
        </button>
      </div>

      {tab === 'users' ? (
        !users ? (
          <Spinner />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                  <th className="px-5 py-3">Utilisateur</th>
                  <th className="px-5 py-3">Rôle</th>
                  <th className="px-5 py-3">Région</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        className="input !w-44 !py-1.5 text-xs"
                        value={u.role}
                        disabled={u.role === 'super_admin'}
                        onChange={(e) => updateUser(u.id, { role: e.target.value as User['role'] })}
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        className="input !w-36 !py-1.5 text-xs"
                        value={u.region || ''}
                        onChange={(e) => updateUser(u.id, { region: e.target.value })}
                      >
                        <option value="">—</option>
                        {REGIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => updateUser(u.id, { active: u.active ? 0 : 1 })}
                        className={`badge ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {u.active ? 'Actif' : 'Désactivé'}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {u.role === 'super_admin' ? 'Compte protégé' : 'Modifiable'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : !models ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <div key={m.id} className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-semibold text-gray-900">{m.crop_type}</h3>
                <span className={`badge ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {m.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">{m.algorithm} · {m.version}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-gray-50 py-2">
                  <p className="text-[10px] text-gray-400">MAPE</p>
                  <p className="text-sm font-bold text-gray-800">{formatNumber(m.mape)}%</p>
                </div>
                <div className="rounded-lg bg-gray-50 py-2">
                  <p className="text-[10px] text-gray-400">RMSE</p>
                  <p className="text-sm font-bold text-gray-800">{formatNumber(m.rmse, 2)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 py-2">
                  <p className="text-[10px] text-gray-400">R²</p>
                  <p className="text-sm font-bold text-gray-800">{formatNumber(m.r2, 2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
