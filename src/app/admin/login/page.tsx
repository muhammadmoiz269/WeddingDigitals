"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Login failed");
        return;
      }

      router.push("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-page">
        {/* Decorative background */}
        <div className="login-bg-pattern" />

        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <span className="login-logo__mark">P</span>
          </div>

          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to access the admin panel</p>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Error message */}
            {error && (
              <div className="login-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">Email</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  required
                  autoComplete="email"
                  autoFocus
                  className="login-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label className="login-label" htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="login-input"
                />
                <button
                  type="button"
                  className="login-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="login-footer">
            Paighaam Wedding Cards — Admin Access Only
          </p>
        </div>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0A0807;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }

        .login-bg-pattern {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 50%, rgba(201,169,110,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 50%, rgba(201,169,110,0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.03) 0%, transparent 40%);
          pointer-events: none;
        }

        .login-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: #111009;
          border: 1px solid rgba(201,169,110,0.15);
          border-radius: 20px;
          padding: 2.5rem 2rem;
          box-shadow: 0 25px 60px rgba(0,0,0,0.5);
          animation: login-slide-up 0.4s ease;
        }
        @keyframes login-slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .login-logo__mark {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #C9A96E, #D4B87A);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-heading, Georgia, serif);
          font-size: 1.5rem;
          font-weight: 700;
          color: #0A0807;
        }

        .login-title {
          font-family: var(--font-heading, Georgia, serif);
          font-size: 1.625rem;
          font-weight: 700;
          color: #FAF8F5;
          text-align: center;
          margin-bottom: 0.375rem;
        }
        .login-subtitle {
          font-size: 0.875rem;
          color: #6a5a4a;
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.125rem;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(220,38,38,0.1);
          border: 1px solid rgba(220,38,38,0.2);
          border-radius: 10px;
          color: #f87171;
          font-size: 0.8125rem;
          font-weight: 500;
          animation: login-shake 0.3s ease;
        }
        @keyframes login-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .login-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #a09080;
          letter-spacing: 0.03em;
        }
        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .login-input-icon {
          position: absolute;
          left: 0.875rem;
          color: #5a4a3a;
          pointer-events: none;
          flex-shrink: 0;
        }
        .login-input {
          width: 100%;
          padding: 0.75rem 0.875rem 0.75rem 2.75rem;
          background: #1C1916;
          border: 1px solid rgba(201,169,110,0.15);
          border-radius: 10px;
          color: #EDE5D8;
          font-size: 0.9375rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .login-input:focus {
          border-color: rgba(201,169,110,0.5);
          box-shadow: 0 0 0 3px rgba(201,169,110,0.08);
        }
        .login-input::placeholder { color: #3a2a1a; }

        .login-toggle-pw {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: #5a4a3a;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: color 0.2s;
          display: flex;
        }
        .login-toggle-pw:hover { color: #C9A96E; }

        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.8rem;
          margin-top: 0.5rem;
          background: linear-gradient(135deg, #C9A96E, #D4B87A);
          color: #0A0807;
          font-size: 0.9375rem;
          font-weight: 700;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #B8944D, #C9A96E);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(201,169,110,0.35);
        }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        @keyframes login-spin { to { transform: rotate(360deg); } }
        .login-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #0A0807;
          border-radius: 50%;
          animation: login-spin 0.6s linear infinite;
          display: inline-block;
        }

        .login-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.72rem;
          color: #3a2a1a;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
      `}</style>
    </>
  );
}
