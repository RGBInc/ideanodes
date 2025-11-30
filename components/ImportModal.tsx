
import React, { useState } from 'react';
import { X, FileText, Upload } from 'lucide-react';
import VoiceButton from './VoiceButton';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleVoiceInput = (transcript: string) => {
    setText(prev => {
      const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
      return prev + spacer + transcript;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-2xl p-6 shadow-2xl shadow-indigo-500/20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Import & Structure</h2>
              <p className="text-slate-400 text-sm">Paste unstructured text, chat logs, or articles.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <p className="text-slate-300 mb-4 text-sm leading-relaxed">
          The AI will deconstruct your text into a logical sequence of sequential thought nodes.
        </p>

        <div className="mb-6 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here..."
            className="w-full h-64 bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none font-mono text-sm"
            autoFocus
          />
          <div className="absolute bottom-4 right-4 bg-slate-900/80 rounded-full">
            <VoiceButton onTranscript={handleVoiceInput} />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (text.trim()) onImport(text);
            }}
            disabled={!text.trim()}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
          >
            <Upload size={18} />
            Structure Nodes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
