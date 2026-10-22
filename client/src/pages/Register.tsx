import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../auth';

const REGIONS = ['Centre', 'Littoral', 'Ouest', 'Nord', 'Extrême-Nord'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'agriculteur',
    region: 'Centre',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'inscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-dark flex min-h-screen items-center justify-center bg-[#0f1512] px-4 py-10 text-[#e5e7eb]">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#86efac] text-2xl text-[#0b130e]">
            🌾
          </div>
          <p className="text-xl font-bold text-[#86efac]">AgroPredict</p>
        </div>
        <div className="card p-8">
          <h2 className="font-heading text-2xl font-bold text-white">
            Créer un compte
          </h2>
          <p className="mt-1 text-sm text-[#8b9792]">
            Rejoignez la plateforme en quelques étapes.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Nom complet</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input
                  className="input"
                  placeholder="+237 6XX XXX XXX"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Profil</label>
                <select
                  className="input"
                  value={form.role}
                  onChange={(e) => set('role', e.target.value)}
                >
                  {Object.entries(ROLE_LABELS)
                    .filter(([k]) => k !== 'super_admin')
                    .map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="label">Région</label>
                <select
                  className="input"
                  value={form.region}
                  onChange={(e) => set('region', e.target.value)}
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
                {error}
              </div>
            )}
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#8b9792]">
            Déjà inscrit ?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#86efac] hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
