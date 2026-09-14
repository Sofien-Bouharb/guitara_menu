"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, ShieldCheck, Eye, EyeOff, AlertCircle, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setError("Adresse email ou mot de passe incorrect.");
      setIsLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <BrandLogo size="lg" showSubtitle={true} />

          <p className="login-brand-desc">
            Espace d&apos;administration de Guitara.
          </p>
        </div>

        {error && (
          <div className="login-error-popup" role="alert">
            <div className="login-error-icon">
              <AlertCircle size={18} />
            </div>

            <div className="login-error-content">
              <span className="login-error-title">Échec de connexion</span>

              <span className="login-error-message">{error}</span>
            </div>

            <button
              type="button"
              className="login-error-close"
              onClick={() => setError(null)}
              aria-label="Fermer le message d'erreur"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form className="form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Adresse Email</label>

            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de Passe</label>

            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="input password-input"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-secondary btn--full"
          >
            <LogIn size={16} />

            {isLoading ? "Connexion en cours..." : "Se Connecter"}
          </button>
        </form>

        <div className="login-footer">
          <ShieldCheck size={14} />

          <span>Co-working Space • Guitara Website v1.0</span>
        </div>
      </div>
    </main>
  );
}
