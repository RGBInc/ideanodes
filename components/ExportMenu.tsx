
import React, { useState, useRef, useEffect } from 'react';
import { Download, FileJson, FileText } from 'lucide-react';
import { audio } from '../services/audioService';

interface ExportMenuProps {
  onExportJSON: () => void;
  onExportMarkdown: () => void;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ onExportJSON, onExportMarkdown }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    audio.playClick();
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => {
    audio.playClick();
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
        title="Export"
      >
        <Download size={20} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Export As</span>
          </div>
          <button
            onClick={() => handleAction(onExportJSON)}
            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition-colors group"
          >
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
              <FileJson size={16} className="text-indigo-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">JSON Data</span>
              <span className="text-[10px] text-slate-400">Backup & Data</span>
            </div>
          </button>
          <div className="h-px bg-slate-100 dark:bg-slate-700/50 mx-4" />
          <button
            onClick={() => handleAction(onExportMarkdown)}
            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition-colors group"
          >
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
              <FileText size={16} className="text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Markdown Document</span>
              <span className="text-[10px] text-slate-400">Blog & Docs</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
