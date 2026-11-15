import { useState } from 'react';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) setError(error);
  };

  return (
    <div className="login-screen">
      <div className="noise" />
      <div className="login-card">
        <a className="brand" href="/">
          <img src="/images/MRI_NET_LOGO.png" alt="Morales Royal Industries" />
        </a>
        <div className="login-header">
          <div className="login-icon"><ShieldCheck size={28} strokeWidth={1.4} /></div>
          <h1>Private Dashboard</h1>
          <p>Sign in to manage your QR codes and sales.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <Mail size={16} />
            <input
              type="email"
              placeholder="you@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="field">
            <Lock size={16} />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="button button-primary login-submit" disabled={busy}>
            {busy ? 'Please wait…' : 'Sign in'}
            {!busy && <ArrowRight size={17} />}
          </button>
        </form>

        <a className="login-back" href="/">← Back to website</a>
      </div>
    </div>
  );
}
