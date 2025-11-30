
import React, { useState } from 'react';
import { X, Sparkles, Layers } from 'lucide-react';
import VoiceButton from './VoiceButton';

interface RemixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRemix: (topic: string) => void;
  sourceCount: number;
}

const RemixModal: React.FC<RemixModalProps> = ({ isOpen, onClose, onRemix, sourceCount }) => {
  const [topic, setTopic] = useState('');

  if (!isOpen) return null;

  const handleVoiceInput = (text: string) => {
    setTopic(prev => {
      const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
      return prev + spacer + text;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl shadow-indigo-500/20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Layers size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Remix Thought Pattern</h2>
              <p className="text-slate-400 text-sm">Using {sourceCount} nodes as a structural blueprint</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <p className="text-slate-300 mb-4 text-sm leading-relaxed">
          The AI will replicate the <strong>depth, complexity, and logical flow</strong> of your current thoughts, but translated into a completely new context. It's not just a rewrite; it's a structural clone.
        </p>

        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Target Topic / New Idea
          </label>
          <div className="relative">
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Sustainable Urban Farming, Mars Colonization Logistics..."
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 pr-10 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              autoFocus
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <VoiceButton onTranscript={handleVoiceInput} />
            </div>
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
              if (topic.trim()) onRemix(topic);
            }}
            disabled={!topic.trim()}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
          >
            <Sparkles size={18} />
            Generate Remix
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemixModal;
