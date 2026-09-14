"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@guitara-coffee.tn");
  const [password, setPassword] = useState("••••••••");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  function handleDemoAccess() {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/admin");
    }, 200);
  }

  return (
    <main className="login-page">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand">
          <BrandLogo size="lg" showSubtitle={true} />
          <p className="login-brand-desc">
            Espace d&apos;administration du menu et de la zone de co-working
            universitaire.
          </p>
        </div>

        {/* Demo Mode Highlight Banner */}
        <div className="login-demo-banner">
          <div className="login-demo-header">
            <Sparkles size={16} />
            <span>Mode Aperçu Statique (Prêt pour test UI)</span>
          </div>
          <p className="login-demo-desc">
            Vous testez actuellement la version statique UI. Cliquez ci-dessous
            pour entrer directement dans le tableau de bord sans mot de passe.
          </p>
        </div>

        <div className="login-divider">
          <div className="login-divider-line" />
          <span className="login-divider-text">Ou Connexion Supabase</span>
        </div>

        {/* Login Form */}
        <form className="form" onSubmit={handleLogin}>
          {error && (
            <div className="status-message status-message--error">{error}</div>
          )}
          <div className="form-group">
            <label htmlFor="email">Adresse Email</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de Passe</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-secondary btn--full"
          >
            <LogIn size={16} />
            {isLoading ? "Connexion en cours..." : "Se Connecter avec Supabase"}
          </button>
        </form>

        {/* Footer Note */}
        <div className="login-footer">
          <ShieldCheck size={14} />
          <span>Université Co-working Space • Menu Guitara v1.0</span>
        </div>
      </div>
    </main>
  );
}
