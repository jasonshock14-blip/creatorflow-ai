
import React, { useState } from 'react';
import { translateMedia, translateText } from '../services/geminiService';
import { TranslationStyle } from '../types';

const TranslatePanel: React.FC = () => {
  const [inputType, setInputType] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState('Burmese');
  const [selectedStyles, setSelectedStyles] = useState<TranslationStyle[]>([TranslationStyle.RECAP, TranslationStyle.PURE]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Partial<Record<TranslationStyle, string>>>({});
  const [statusMessage, setStatusMessage] = useState('');

  const styles = [
    { id: TranslationStyle.RECAP, title: 'Storyteller Narration', desc: 'Detailed 10+ Min Cinematic Retelling' },
    { id: TranslationStyle.PURE, title: 'Pure Translation', desc: 'Full Word-for-Word Translation' },
    { id: TranslationStyle.DEEP_INSIGHTS, title: 'Deep Insights', desc: 'Context & Subtext Analysis' },
    { id: TranslationStyle.VIRAL_HOOKS, title: 'Viral Studio', desc: 'Catchy Titles & Thumbnail Ideas' },
  ];

  const toggleStyle = (styleId: TranslationStyle) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(s => s !== styleId) 
        : [...prev, styleId]
    );
  };

  const handleProcess = async () => {
    if (inputType === 'file' && !file) return;
    if (inputType === 'text' && !inputText.trim()) return;
    if (selectedStyles.length === 0) return;

    setLoading(true);
    setResults({});
    setStatusMessage('Analyzing content for deep retelling...');

    try {
      let contentBase64 = '';
      let mimeType = '';

      if (inputType === 'file' && file) {
        const reader = new FileReader();
        // Fix: Explicitly type the Promise as string to avoid 'unknown' type inference which can cause issues in function calls later
        contentBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        mimeType = file.type || 'application/vnd.apple.mpegurl';
      } else {
        contentBase64 = inputText;
      }

      for (const style of selectedStyles) {
        setStatusMessage(`Generating ${style.toUpperCase()}...`);
        const output = inputType === 'file' 
          ? await translateMedia(contentBase64, mimeType, language, style)
          : await translateText(contentBase64, language, style);
        
        setResults(prev => ({ ...prev, [style]: output }));
      }
    } catch (e) {
      console.error(e);
      setStatusMessage('Error processing bundle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold mb-2 text-indigo-400">Creator Bundle</h2>
        <p className="text-slate-400">Generate long-form cinematic scripts and viral assets from any source.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Config */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-2xl space-y-5">
            <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button 
                onClick={() => setInputType('file')} 
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${inputType === 'file' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Media
              </button>
              <button 
                onClick={() => setInputType('text')} 
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${inputType === 'text' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Text
              </button>
            </div>

            {inputType === 'file' ? (
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                className="w-full text-xs text-slate-400 p-4 border-2 border-dashed border-slate-800 rounded-xl cursor-pointer" 
              />
            ) : (
              <textarea 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                placeholder="Paste original script here..." 
                className="w-full h-32 bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm focus:border-indigo-500 outline-none transition-colors resize-none" 
              />
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Language</label>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-colors"
              >
                <option>Burmese</option>
                <option>English</option>
                <option>Spanish</option>
                <option>Thai</option>
                <option>Chinese</option>
                <option>Japanese</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bundle Package</label>
              <div className="grid grid-cols-1 gap-2">
                {styles.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => toggleStyle(s.id)} 
                    className={`text-left p-3 rounded-xl border transition-all ${selectedStyles.includes(s.id) ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm font-semibold ${selectedStyles.includes(s.id) ? 'text-indigo-400' : 'text-slate-200'}`}>{s.title}</p>
                      {selectedStyles.includes(s.id) && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>}
                    </div>
                    <p className="text-[10px] text-slate-500">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleProcess} 
              disabled={loading || (inputType === 'file' && !file) || (inputType === 'text' && !inputText)} 
              className="w-full py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none"
            >
              {loading ? 'Processing Bundle...' : 'Generate Bundle'}
            </button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 space-y-6">
          {loading && Object.keys(results).length === 0 ? (
            <div className="glass h-full min-h-[500px] rounded-2xl flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute top-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-xl font-semibold mb-2">{statusMessage}</p>
              <p className="text-sm text-slate-500">Generating exhaustive, high-detail scripts for your production...</p>
            </div>
          ) : Object.keys(results).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(results).map(([styleId, text]) => (
                <div key={styleId} className="glass rounded-2xl p-6 space-y-4 border-l-4 border-indigo-500 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tighter">
                        {styles.find(s => s.id === styleId)?.title}
                      </h3>
                      <p className="text-[10px] text-indigo-400 font-medium tracking-widest uppercase">Production Asset</p>
                    </div>
                    <button 
                      // Fix: Explicitly cast 'text' to string to satisfy type requirements of writeText if inferred as unknown
                      onClick={() => text && navigator.clipboard.writeText(text as string)}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy
                    </button>
                  </div>
                  <div className="bg-slate-950/80 p-6 rounded-xl font-serif text-base leading-relaxed border border-slate-800 text-slate-200 overflow-auto max-h-[600px] whitespace-pre-wrap shadow-inner">
                    {text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-800 h-full min-h-[500px] rounded-2xl flex flex-col items-center justify-center p-12 text-slate-600 text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-slate-400">Bundle Workspace</p>
              <p className="text-sm max-w-xs mx-auto">Upload media or paste text and run the bundle to generate high-detail cinematic retellings and viral hooks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslatePanel;
