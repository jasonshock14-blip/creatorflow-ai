
import React, { useState, useEffect } from 'react';
import { loginUser, AuthSession } from '../services/authService';
import { getDeviceId } from '../services/deviceService';

interface LoginProps {
  onLoginSuccess: (session: AuthSession) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate small network delay for feel
    setTimeout(() => {
      const result = loginUser(username, password);
      if (result.success && result.session) {
        onLoginSuccess(result.session);
      } else {
        setError(result.message);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-4 ring-1 ring-white/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">CreatorFlow <span className="text-indigo-400">AI</span></h1>
          <p className="text-slate-500 text-sm mt-2">Hardware-Locked Creative Suite</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-5 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Account Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all text-white"
              placeholder="Your ID"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Token</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all text-white"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-400 animate-in shake duration-300">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold text-white shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Unlock Studio'
            )}
          </button>

          <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-2">
            <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Digital Hardware Fingerprint</span>
            <code className="text-[10px] bg-slate-900 text-indigo-400 px-4 py-2 rounded-lg border border-indigo-500/30 font-mono">
              {deviceId || 'Analyzing Hardware...'}
            </code>
          </div>
        </form>

        <p className="text-center mt-8 text-slate-600 text-xs">
          Real-device tracking enabled. Accounts are physically bound to this machine.
        </p>
      </div>
    </div>
  );
};

export default Login;
