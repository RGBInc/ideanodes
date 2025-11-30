import React from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { Id } from "../convex/_generated/dataModel";

export function FooterMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <>
      {/* Info Menu (Bottom Right) - Desktop Only now, mobile is in header */}
      <div className="fixed bottom-8 right-8 z-50 hidden md:block">
        <div className="relative">
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
              <div className="absolute bottom-full right-0 mb-3 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <Link 
                  to="/terms" 
                  className="block w-full text-left px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
                <Link 
                  to="/privacy" 
                  className="block w-full text-left px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                <div className="px-4 py-2 text-xs text-zinc-400">
                  © {new Date().getFullYear()} IdeaNodes
                </div>
              </div>
            </>
          )}
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-lg transition-all hover:scale-105"
          >
            <Info size={20} />
          </button>
        </div>
      </div>
    </>
  );
}
