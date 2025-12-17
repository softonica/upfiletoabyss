import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Settings, Sparkles, AlertCircle, Link as LinkIcon, CheckCircle, RefreshCw, Server, Moon, Sun } from 'lucide-react';
import { ServiceType, UploadItem, UploadStatus, ServiceKeys } from './types';
import { extractLinksFromText } from './services/geminiService';
import { initiateRemoteUpload } from './services/apiService';
import SettingsModal from './components/SettingsModal';
import StatsCard from './components/StatsCard';

const App: React.FC = () => {
  // State
  const [activeService, setActiveService] = useState<ServiceType>(ServiceType.ABYSS);
  const [urlInput, setUrlInput] = useState('');
  const [apiKeys, setApiKeys] = useState<ServiceKeys>({ abyss: '', filemoon: '' });
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Load data on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('cloudstreamer_keys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
    
    // Check if user has no keys, prompt settings
    if (!savedKeys) {
      setIsSettingsOpen(true);
    }
  }, []);

  // Save keys handler
  const handleSaveKeys = (keys: ServiceKeys) => {
    setApiKeys(keys);
    localStorage.setItem('cloudstreamer_keys', JSON.stringify(keys));
    setIsSettingsOpen(false);
  };

  // Handlers
  const handleAddUpload = async (urlsToProcess: string[] = []) => {
    const urls = urlsToProcess.length > 0 ? urlsToProcess : [urlInput];
    
    if (urls.length === 0 || (urls.length === 1 && !urls[0])) return;

    const newUploads: UploadItem[] = urls.map(url => ({
      id: Math.random().toString(36).substring(7),
      url: url.trim(),
      service: activeService,
      status: UploadStatus.PENDING,
      addedAt: Date.now()
    })).filter(u => u.url.length > 0);

    setUploads(prev => [...newUploads, ...prev]);
    setUrlInput('');

    // Process immediately
    newUploads.forEach(item => processUpload(item));
  };

  const processUpload = async (item: UploadItem) => {
    // Update status to uploading
    updateUploadStatus(item.id, UploadStatus.UPLOADING);

    try {
      const apiKey = activeService === ServiceType.ABYSS ? apiKeys.abyss : apiKeys.filemoon;
      const response = await initiateRemoteUpload(item.service, apiKey, item.url);

      if (response.status === 200 && response.result) {
        setUploads(prev => prev.map(u => 
          u.id === item.id 
            ? { ...u, status: UploadStatus.COMPLETED, resultId: response.result?.filecode } 
            : u
        ));
      } else {
        throw new Error(response.msg || 'Unknown error from server');
      }
    } catch (error: any) {
      setUploads(prev => prev.map(u => 
        u.id === item.id 
          ? { ...u, status: UploadStatus.ERROR, error: error.message } 
          : u
      ));
    }
  };

  const updateUploadStatus = (id: string, status: UploadStatus) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, status } : u));
  };

  const handleSmartPaste = async () => {
    if (!urlInput) return;
    setIsExtracting(true);
    try {
      const extractedUrls = await extractLinksFromText(urlInput);
      if (extractedUrls.length > 0) {
        await handleAddUpload(extractedUrls);
        setUrlInput(''); 
      } else {
        alert("No valid URLs found in the text.");
      }
    } catch (e) {
      alert("AI Extraction failed.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKeys={apiKeys} 
        onSave={handleSaveKeys} 
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
              CloudStreamer
            </h1>
            <p className="text-slate-500 text-sm">Remote upload client for premium file hosts</p>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard 
            label="Active Uploads" 
            value={uploads.filter(u => u.status === UploadStatus.UPLOADING || u.status === UploadStatus.PENDING).length}
            icon={<RefreshCw className="w-5 h-5 text-blue-400 animate-spin-slow" />}
            colorClass="bg-blue-500/10 text-blue-400"
          />
           <StatsCard 
            label="Completed" 
            value={uploads.filter(u => u.status === UploadStatus.COMPLETED).length}
            icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
            colorClass="bg-emerald-500/10 text-emerald-400"
          />
           <StatsCard 
            label="Active Service" 
            value={activeService}
            icon={<Server className="w-5 h-5 text-violet-400" />}
            colorClass="bg-violet-500/10 text-violet-400"
          />
        </div>

        {/* Main Input Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
          
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveService(ServiceType.ABYSS)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all ${
                activeService === ServiceType.ABYSS 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-slate-950 text-slate-500 hover:text-slate-300'
              }`}
            >
              <Moon className="w-4 h-4" /> Abyss.to
            </button>
            <button
              onClick={() => setActiveService(ServiceType.FILEMOON)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all ${
                activeService === ServiceType.FILEMOON
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
                : 'bg-slate-950 text-slate-500 hover:text-slate-300'
              }`}
            >
              <Sun className="w-4 h-4" /> Filemoon.sx
            </button>
          </div>

          <div className="space-y-4">
            <textarea
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste direct URLs here (one per line) or a block of text..."
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none font-mono text-sm"
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => handleAddUpload()}
                disabled={!urlInput.trim() || isExtracting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-5 h-5" />
                Upload Direct
              </button>
              
              <button
                onClick={handleSmartPaste}
                disabled={!urlInput.trim() || isExtracting}
                className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-violet-400 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700"
              >
                {isExtracting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                AI Smart Extract & Upload
              </button>
            </div>
            <p className="text-xs text-slate-600 text-center">
              *Note: Ensure API Keys are set in settings. Smart Extract uses Gemini to find links in messy text.
            </p>
          </div>
        </div>

        {/* Upload Queue */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> Transfer Queue
          </h3>
          
          {uploads.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-slate-600">
              <Upload className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No uploads in queue</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {uploads.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between group hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className={`p-2 rounded-lg ${
                      item.status === UploadStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-500' :
                      item.status === UploadStatus.ERROR ? 'bg-red-500/10 text-red-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {item.status === UploadStatus.COMPLETED ? <CheckCircle className="w-5 h-5" /> :
                       item.status === UploadStatus.ERROR ? <AlertCircle className="w-5 h-5" /> :
                       <RefreshCw className="w-5 h-5 animate-spin" />}
                    </div>
                    
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate max-w-md">{item.url}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="uppercase tracking-wider">{item.service}</span>
                        <span>•</span>
                        <span>{new Date(item.addedAt).toLocaleTimeString()}</span>
                        {item.resultId && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 font-mono">ID: {item.resultId}</span>
                          </>
                        )}
                      </div>
                      {item.error && (
                        <p className="text-xs text-red-400 mt-1 truncate">{item.error}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        item.status === UploadStatus.COMPLETED ? 'bg-emerald-950 text-emerald-400' :
                        item.status === UploadStatus.ERROR ? 'bg-red-950 text-red-400' :
                        'bg-blue-950 text-blue-400'
                     }`}>
                       {item.status}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;