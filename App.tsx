
import React, { useState, useEffect } from 'react';
import { AppTab, AuthSession } from './types';
import TranscribePanel from './components/TranscribePanel';
import TranslatePanel from './components/TranslatePanel';
import SRTTranslatorPanel from './components/SRTTranslatorPanel';
import ViralHooksPanel from './components/ViralHooksPanel';
import Login from './components/Login';
import { getActiveSession, logout, addDeviceIdToUser } from './services/authService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.TRANSCRIBE);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setSession(getActiveSession());
    setIsInitializing(false);
  }, []);

  const handleLogout = () => {
    logout();
    setSession(null);
  };

  const handleAddDeviceId = () => {
    const newId = prompt("Enter a new Device ID to authorize for this account:");
    if (newId && session) {
      addDeviceIdToUser(session.username, newId);
      alert(`Device ID "${newId}" added!`);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={() => setSession(getActiveSession())} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-50 glass border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">CreatorFlow AI</h1>
          </div>

          <nav className="flex gap-1 bg-slate-900/50 p-1 rounded-lg">
            {[
              { id: AppTab.TRANSCRIBE, label: 'Transcribe' },
              { id: AppTab.TRANSLATE, label: 'Translate' },
              { id: AppTab.SRT_TRANSLATOR, label: 'SRT' },
              { id: AppTab.HOOKS, label: 'Hooks' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
             <button onClick={handleAddDeviceId} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-indigo-400">
               Add Device
             </button>
             <button onClick={handleLogout} className="px-4 py-2 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg border border-red-500/20">
               Logout
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === AppTab.TRANSCRIBE && <TranscribePanel />}
        {activeTab === AppTab.TRANSLATE && <TranslatePanel />}
        {activeTab === AppTab.SRT_TRANSLATOR && <SRTTranslatorPanel />}
        {activeTab === AppTab.HOOKS && <ViralHooksPanel />}
      </main>
    </div>
  );
};

export default App;
