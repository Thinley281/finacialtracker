import React, { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Ensure this path matches your actual file structure
import { supabase } from '../lib/supabase'; 
import TermsModal from '../component/Termsmodal';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);

  const navigate = useNavigate();

  // FIX: Added FormEvent type for the submit handler
  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (authError) {
        setError(authError.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(): Promise<void> {
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${window.location.origin}/dashboard` 
        },
      });
      if (oauthError) setError(oauthError.message);
    } catch (err: any) {
      setError("Could not initialize Google Login.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 flex flex-col font-sans">

      {/* ── Top Navigation Bar ── */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-sm">
        <span className="text-2xl font-bold text-white tracking-tight">
          💰 FinTrack
        </span>
        <div className="flex gap-6 items-center">
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Terms of Service
          </button>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* ── Main Card ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

          <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to manage your finances</p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-2 focus-within:ring-2 focus-within:ring-blue-400 transition">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 py-3 text-sm outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-2 focus-within:ring-2 focus-within:ring-blue-400 transition">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 py-3 text-sm outline-none bg-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all tracking-widest text-sm uppercase shadow-lg shadow-blue-200"
            >
              {loading ? 'Signing in…' : '🔑 Sign In'}
            </button>
          </form>

          <div className="flex items-center my-5 gap-3">
            <hr className="flex-1 border-gray-200" />
            <span className="text-gray-400 text-xs">or continue with</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 active:scale-95 py-3.5 rounded-2xl transition-all text-sm font-semibold text-gray-700 shadow-sm"
          >
            {/* Google Icon SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <div className="mt-6 text-center space-y-2">
            <Link to="/forgot-password" className="block text-blue-500 text-sm hover:underline">
              Forgot password?
            </Link>
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-500 font-semibold hover:underline">
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>

      {showTerms && (
  <TermsModal 
    isOpen={showTerms} 
    onClose={() => setShowTerms(false)} 
  />
)}
    </div>
  );
}