// src/pages/RegisterPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Registration form with:
//  • First name + Last name
//  • Email + Password
//  • Terms of Service checkbox (required)
//  • Sign up with Google
//  • Links to Terms of Service and Privacy Policy modals
// ─────────────────────────────────────────────────────────────────────────────
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import TermsModal from '../component/Termsmodal';

export default function RegisterPage() {
  // ── form state ──────────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [agreed, setAgreed]       = useState(false);    // terms checkbox
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const navigate = useNavigate();

  // ── handlers ────────────────────────────────────────────────────────────────

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!agreed) {
      setError('Please accept the Terms of Service and Privacy Policy.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    // supabase.auth.signUp creates the user.
    // We pass first_name and last_name in `data` – Supabase stores them in
    // the user's metadata (user.user_metadata).
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      // Supabase sends a confirmation email by default.
      setSuccess('Account created! Check your email to confirm your address.');
      setTimeout(() => navigate('/login'), 3000);
    }
    setLoading(false);
  }

  async function handleGoogleSignUp() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
    if (error) setError(error.message);
  }

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 flex flex-col">

      {/* Navigation bar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-sm">
        <Link to="/" className="font-display text-2xl font-bold text-white tracking-tight">
          💰 FinTrack
        </Link>
        <div className="flex gap-6 items-center">
          <button
            onClick={() => setShowTerms(true)}
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Terms of Service
          </button>
          <Link
            to="/login"
            className="bg-white text-primary-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Registration</h1>
          <p className="text-gray-500 text-sm mb-8">Create your free FinTrack account</p>

          {/* Error / success banners */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">

            {/* First + Last name – side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-2 focus-within:ring-2 focus-within:ring-primary-400 focus-within:border-transparent transition">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 py-3 text-sm outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-2 focus-within:ring-2 focus-within:ring-primary-400 focus-within:border-transparent transition">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="min. 6 characters"
                  className="flex-1 py-3 text-sm outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-500 accent-primary-500"
              />
              <span className="text-sm text-gray-600">
                I have read and accepted the{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-primary-500 hover:underline font-medium"
                >
                  Terms of Service
                </button>{' '}
                and the{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-primary-500 hover:underline font-medium"
                >
                  Privacy Policy
                </button>
              </span>
            </label>

            {/* ── Sign Up button ── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 active:scale-95 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all tracking-widest text-sm uppercase shadow-lg shadow-primary-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account…
                </span>
              ) : '🚀 Sign Up'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5 gap-3">
            <hr className="flex-1 border-gray-200"/>
            <span className="text-gray-400 text-xs font-medium">or continue with</span>
            <hr className="flex-1 border-gray-200"/>
          </div>

          {/* ── Sign up with Google button ── */}
          <button
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 active:scale-95 py-3.5 rounded-2xl transition-all text-sm font-semibold text-gray-700 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <p className="mt-6 text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {showTerms && <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />}
    </div>
  );
}