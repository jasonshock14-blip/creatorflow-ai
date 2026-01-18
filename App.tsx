
import React, { useState, useEffect } from 'react';
import { AppTab } from './types';
import TranscribePanel from './components/TranscribePanel';
import TranslatePanel from './components/TranslatePanel';
import SRTTranslatorPanel from './components/SRTTranslatorPanel';
import ViralHooksPanel from './components/ViralHooksPanel';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { getActiveSession, logoutUser, AuthSession } from './services/authService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.TRANSCRIBE);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    try {
      const currentSession = getActiveSession();
      if (currentSession) {
        setSession(currentSession);
      }
    } catch (e) {
      console.error("Session initialization error:", e);
    } finally {
      setInitializing(false);
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    setSession(null);
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 gap-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold uppercase tracking-widest">Initializing Creative Studio...</span>
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={(newSession) => setSession(newSession)} />;
  }

  const isAdmin = session.username === 'admin';

  const tabs = [
    { id: AppTab.TRANSCRIBE, label: 'Transcribe', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4' },
    { id: AppTab.TRANSLATE, label: 'Translate', icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 7.31 16.208 2 18' },
    { id: AppTab.SRT_TRANSLATOR, label: 'SRT', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
    { id: AppTab.HOOKS, label: 'Hooks', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  if (isAdmin) {
    tabs.push({ id: AppTab.ADMIN, label: 'Admin', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-50 glass border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CreatorFlow <span className="text-indigo-400">AI</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex flex-wrap justify-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AppTab)}
                  className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="transition-opacity duration-300">
          <div className="mb-6 flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            <div className="flex gap-4">
              <span>User: <span className="text-indigo-400">{session.username}</span></span>
              {isAdmin && <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">Admin Mode</span>}
            </div>
            <span>Device ID Verified</span>
          </div>
          {activeTab === AppTab.TRANSCRIBE && <TranscribePanel />}
          {activeTab === AppTab.TRANSLATE && <TranslatePanel />}
          {activeTab === AppTab.SRT_TRANSLATOR && <SRTTranslatorPanel />}
          {activeTab === AppTab.HOOKS && <ViralHooksPanel />}
          {activeTab === AppTab.ADMIN && isAdmin && <AdminPanel />}
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-900 py-12 px-6 text-center">
        <div className="text-slate-500 text-sm italic">"Precision AI for the Next Generation of Creators."</div>
      </footer>
    </div>
  );
};

export default App;
