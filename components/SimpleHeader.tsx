import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function SimpleHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 z-40 h-14 flex items-center justify-between px-4 lg:px-8">
      <Link to="/" className="flex items-center gap-3">
        <Logo className="text-zinc-900 dark:text-white" />
        <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white hidden sm:block">ideanodes</h1>
      </Link>
      
      <Link to="/" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
        Back to App
      </Link>
    </header>
  );
}
