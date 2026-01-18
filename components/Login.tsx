
import React, { useState, useEffect } from 'react';
import { login, registerUser, getCurrentDeviceId } from '../services/authService';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentDeviceId, setCurrentDeviceId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCurrentDeviceId(getCurrentDeviceId());
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentDeviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (isRegister) {
        const result = registerUser(username, password);
        if (result.success) {
          login(username, password);
          onLoginSuccess();
        } else {
          setError(result.error || 'Registration failed');
        }
      } else {
        const result = login(username, password);
        if (result.success) {
          onLoginSuccess();
        } else {
          setError(result.error || 'Login failed');
        }
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="glass p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-400 text-sm">
              {isRegister ? 'Set up your credentials for Creator Studio' : 'Sign in to access your Creator Studio'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
              <input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="Enter username"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>

            {/* Automatic Device ID Display */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Device Identity</label>
              <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3">
                <code className="text-[11px] text-indigo-400 font-mono flex-1 truncate">{currentDeviceId}</code>
                <button 
                  type="button"
                  onClick={handleCopyId}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-indigo-400"
                  title="Copy Device ID"
                >
                  {copied ? (
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-600 mt-1 italic">This ID is unique to your current browser.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 animate-shake">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 py-4 rounded-xl font-bold text-white shadow-xl shadow-indigo-600/10 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isRegister ? 'Register & Enter' : 'Secure Login'
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-slate-800/50">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register now"}
            </button>
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-[10px] mt-8 uppercase tracking-[0.2em]">
          Powered by Gemini 3.0 Pro • Encrypted Session
        </p>
      </div>
    </div>
  );
};

export default Login;
