
import React, { useState } from 'react';
import { transcribeOnly } from '../services/geminiService';

const TranscribePanel: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isSrt, setIsSrt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);
    setStatusMessage('Reading file data...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        setStatusMessage(isSrt ? 'AI is generating SRT with timestamps...' : 'AI is transcribing (word-for-word)...');
        const mimeType = file.type || 'application/vnd.apple.mpegurl';
        const output = await transcribeOnly(base64, mimeType, isSrt);
        setResult(output);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setStatusMessage('Error processing file. Please try again.');
      setLoading(false);
    }
  };

  const downloadFile = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${Date.now()}.${isSrt ? 'srt' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold mb-2 text-indigo-400">Word-for-Word Transcribe</h2>
        <p className="text-slate-400">Convert your media to a perfect, high-accuracy text script or SRT file.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Upload Media</label>
              <div className="relative group">
                <input
                  type="file"
                  accept="audio/*,video/*,.m3u8,application/x-mpegURL,application/vnd.apple.mpegurl"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${file ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 group-hover:border-slate-500'}`}>
                  <svg className={`w-10 h-10 mx-auto mb-3 ${file ? 'text-indigo-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-slate-300 font-medium">{file ? file.name : 'Drop file or click'}</p>
                  <p className="text-xs text-slate-500 mt-2">MP4, MP3, WAV, MOV, M3U8</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Output Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsSrt(false)}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${!isSrt ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                >
                  Plain Text
                </button>
                <button
                  onClick={() => setIsSrt(true)}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${isSrt ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                >
                  SRT Subtitles
                </button>
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={!file || loading}
              className={`w-full py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 ${
                !file || loading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
              }`}
            >
              {loading ? 'Processing...' : 'Start Transcription'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="glass h-full min-h-[400px] rounded-2xl flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute top-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-xl font-semibold mb-2">{statusMessage}</p>
            </div>
          ) : result ? (
            <div className="glass rounded-2xl p-8 space-y-4 animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Transcription Result</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                  >
                    Copy
                  </button>
                  <button 
                    onClick={downloadFile}
                    className="text-xs bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-colors"
                  >
                    Download .{isSrt ? 'srt' : 'txt'}
                  </button>
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap border border-slate-800 overflow-y-auto max-h-[600px]">
                {result}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-800 h-full min-h-[400px] rounded-2xl flex flex-col items-center justify-center p-12 text-slate-600 text-center">
              <p className="text-lg font-medium">No script yet</p>
              <p className="text-sm">Upload a media or playlist file to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscribePanel;
