import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

const DEMO_ACCOUNTS = [
  { role: 'Super Admin', email: 'admin@agropredict.cm' },
  { role: 'Agriculteur', email: 'solange.nkeng@agropredict.cm' },
  { role: 'Chef de coopérative', email: 'maurice.tchoua@agropredict.cm' },
  { role: 'Analyste', email: 'cedric.nganou@agropredict.cm' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f1512] font-sans text-[#e5e7eb]">
      {/* Panneau gauche */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-[#232f2a] bg-[#0f1512] p-12 text-[#e5e7eb] lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#86efac]/20 bg-[#86efac]/10 text-2xl text-[#86efac]">
            🌾
          </div>
          <div>
            <p className="text-xl font-bold text-[#86efac]">AgroPredict</p>
            <p className="text-xs text-[#8b9792]">
              Intelligence Artificielle au service de l'Agriculture
            </p>
          </div>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Anticipez vos récoltes,
            <br />
            sécurisez votre avenir.
          </h1>
          <p className="mt-4 max-w-md text-[#8b9792]">
            Prévisions de rendement à plus de 85 % de précision, alertes
            climatiques précoces et recommandations agronomiques personnalisées
            — accessibles à tous, même hors connexion.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-[#232f2a] bg-white/5 px-4 py-1.5 text-[#e5e7eb]">
              📈 Prévision ML
            </span>
            <span className="rounded-full border border-[#232f2a] bg-white/5 px-4 py-1.5 text-[#e5e7eb]">
              🛰️ Données satellite
            </span>
            <span className="rounded-full border border-[#232f2a] bg-white/5 px-4 py-1.5 text-[#e5e7eb]">
              🔔 Alertes SMS
            </span>
          </div>
        </div>
        <p className="relative text-xs text-[#5c6863]">
          5 régions pilotes · Cameroun · CDC V2.0
        </p>
      </div>

      {/* Formulaire */}
      <div className="flex w-full items-center justify-center bg-[#0f1512] px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#86efac] text-2xl text-[#0b130e]">
              🌾
            </div>
            <p className="text-xl font-bold text-[#86efac]">AgroPredict</p>
          </div>
          <h2 className="text-2xl font-bold text-white">Bon retour 👋</h2>
          <p className="mt-1 text-sm text-[#8b9792]">
            Connectez-vous pour accéder à vos prévisions.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-[0.04em] text-[#8b9792]">
                Adresse email
              </label>
              <input
                className="w-full rounded-md border border-[#232f2a] bg-[#1a2320] px-3.5 py-2.5 text-sm text-[#e5e7eb] placeholder:text-[#8b9792] outline-none transition focus:border-[#86efac] focus:ring-2 focus:ring-[#86efac]/20"
                type="email"
                placeholder="vous@exemple.cm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-[0.04em] text-[#8b9792]">
                Mot de passe
              </label>
              <input
                className="w-full rounded-md border border-[#232f2a] bg-[#1a2320] px-3.5 py-2.5 text-sm text-[#e5e7eb] placeholder:text-[#8b9792] outline-none transition focus:border-[#86efac] focus:ring-2 focus:ring-[#86efac]/20"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
                {error}
              </div>
            )}
            <button
              className="w-full rounded-md bg-[#86efac] px-4 py-2.5 text-sm font-bold text-[#0b130e] transition hover:bg-[#a7f3d0] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#8b9792]">
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#86efac] hover:underline"
            >
              Créer un compte
            </Link>
          </p>

          <div className="mt-8 rounded-2xl border border-[#232f2a] bg-[#161e1b] p-4">
            <p className="text-xs font-semibold text-[#8b9792]">
              🔑 Comptes de démonstration (mot de passe :{' '}
              <code className="rounded bg-[#1a2320] px-1 text-[#e5e7eb]">
                Demo@2026
              </code>
              )
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  onClick={() => setEmail(a.email)}
                  className="flex items-center justify-between rounded-lg border border-[#232f2a] bg-[#1a2320] px-3 py-2 text-left text-xs transition hover:bg-[#1f2a26]"
                >
                  <span className="font-medium text-[#e5e7eb]">{a.role}</span>
                  <span className="text-[#5c6863]">{a.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
