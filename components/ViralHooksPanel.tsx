
import React, { useState } from 'react';
import { generateViralBundle, generateImage } from '../services/geminiService';
import { ViralIdea } from '../types';

const ViralHooksPanel: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('Burmese');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ViralIdea[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [generatingImg, setGeneratingImg] = useState<Record<string, boolean>>({});
  const [generatedImgs, setGeneratedImgs] = useState<Record<string, string>>({});

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setExpandedIdx(null);
    setGeneratedImgs({});
    try {
      const results = await generateViralBundle(topic, language);
      setIdeas(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateImage = async (idx: number, prompt: string, type: 'text' | 'no-text') => {
    const key = `${idx}-${type}`;
    setGeneratingImg(prev => ({ ...prev, [key]: true }));
    try {
      const url = await generateImage(prompt);
      setGeneratedImgs(prev => ({ ...prev, [key]: url }));
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingImg(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold mb-2 text-indigo-400">Viral Studio</h2>
        <p className="text-slate-400">Architect long-form (10+ minute) content strategies with roadmaps and thumbnail assets.</p>
      </div>

      <div className="glass p-8 rounded-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Focus Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The forgotten history of Bagan"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Output Language</label>
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
        </div>
        <button
          onClick={handleGenerate}
          disabled={!topic || loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 py-4 rounded-xl font-bold transition-all shadow-xl shadow-indigo-500/20"
        >
          {loading ? 'Designing 10-Minute Strategy...' : 'Generate 5 Long-Form Bundles'}
        </button>
      </div>

      <div className="space-y-4">
        {ideas.map((idea, idx) => (
          <div key={idx} className={`glass rounded-2xl overflow-hidden transition-all duration-500 border-l-4 border-indigo-500 ${expandedIdx === idx ? 'ring-2 ring-indigo-500/50' : 'hover:bg-slate-900/40'}`}>
            <div 
              className="p-6 cursor-pointer flex items-center justify-between"
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            >
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 font-bold">{idx + 1}</div>
                <div className="overflow-hidden">
                  <h3 className="text-slate-100 font-bold truncate">{idea.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">10+ Min Plan</span>
                    <p className="text-xs text-slate-400 truncate italic">" {idea.thumbnailText} "</p>
                  </div>
                </div>
              </div>
              <svg className={`w-5 h-5 text-slate-500 transition-transform ${expandedIdx === idx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {expandedIdx === idx && (
              <div className="px-6 pb-8 space-y-6 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Roadmap Section */}
                  <div className="lg:col-span-1 space-y-3">
                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">10-Minute Production Roadmap</h4>
                    <div className="bg-slate-900/50 rounded-xl p-5 text-xs text-slate-300 leading-relaxed border border-slate-800 whitespace-pre-wrap">
                      {idea.roadmap}
                    </div>
                  </div>

                  {/* Script/Hook Section */}
                  <div className="lg:col-span-1 space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Opening Hook & Sample</h4>
                    <div className="bg-slate-950/80 rounded-xl p-5 text-sm text-slate-300 leading-relaxed border border-slate-800 max-h-[300px] overflow-y-auto italic font-serif">
                      <p className="font-bold text-indigo-400 mb-2 not-italic">Intro Hook:</p>
                      {idea.hook}
                      <div className="my-4 border-t border-slate-800"></div>
                      <p className="font-bold text-indigo-400 mb-2 not-italic">Style Preview:</p>
                      {idea.script}
                    </div>
                  </div>
                  
                  {/* Thumbnail Studio */}
                  <div className="lg:col-span-1 space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Thumbnail Assets</h4>
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 mb-3">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Recommended Text Overlay:</p>
                      <p className="text-lg font-black text-white uppercase tracking-tighter italic">"{idea.thumbnailText}"</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {['text', 'no-text'].map((type) => {
                        const key = `${idx}-${type}`;
                        const isGen = generatingImg[key];
                        const img = generatedImgs[key];
                        const prompt = type === 'text' ? idea.thumbPromptWithText : idea.thumbPromptNoText;

                        return (
                          <div key={type} className="space-y-2">
                            <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center relative group">
                              {img ? (
                                <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
                              ) : isGen ? (
                                <div className="flex flex-col items-center gap-2">
                                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-[10px] text-slate-500">Painting...</span>
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-600 text-center px-4">Click to Generate</div>
                              )}
                            </div>
                            <button 
                              onClick={() => handleCreateImage(idx, prompt, type as 'text' | 'no-text')}
                              disabled={isGen}
                              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold transition-all border border-slate-700 text-slate-400 hover:text-white"
                            >
                              {type === 'text' ? 'Visual + Text' : 'Base Visual'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViralHooksPanel;
