import React, { useState, useEffect } from 'react';
import { ServiceKeys } from '../types';
import { X, Key, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ServiceKeys;
  onSave: (keys: ServiceKeys) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKeys, onSave }) => {
  const [keys, setKeys] = useState<ServiceKeys>(apiKeys);

  useEffect(() => {
    setKeys(apiKeys);
  }, [apiKeys]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Service Credentials</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-400">
            Your API keys are stored locally in your browser. They are required to authenticate uploads.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Abyss.to API Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={keys.abyss}
                  onChange={(e) => setKeys({ ...keys, abyss: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Paste your Abyss key"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Filemoon.sx API Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={keys.filemoon}
                  onChange={(e) => setKeys({ ...keys, filemoon: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Paste your Filemoon key"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => onSave(keys)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Save Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;