import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xl z-50 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">We use cookies</h3>
        <button onClick={() => setIsVisible(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
          <X size={16} />
        </button>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
        We use cookies to enhance your experience, analyze site traffic, and for authentication. 
        By clicking "Accept", you consent to our use of cookies.
      </p>
      <div className="flex gap-2">
        <button 
          onClick={handleAccept}
          className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
        >
          Accept
        </button>
        <button 
          onClick={() => setIsVisible(false)}
          className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 py-2 rounded-lg text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
