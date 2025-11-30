
import React from 'react';
import { Logo } from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1120] pb-16 pt-16 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Logo & Tagline */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 mb-4">
            <Logo className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-2">Ideanodes</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            A sequential thinking engine designed to mimic biological thought processes and expand your ideas into actionable blueprints.
          </p>
        </div>

        {/* 4 Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><a href="#" className="hover:text-indigo-500 transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Methodology</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Enterprise</a></li>
            </ul>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Prompt Guide</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Community Hub</a></li>
            </ul>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Data Security</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-sm uppercase tracking-wider">Social</h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Twitter / X</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Discord</a></li>
            </ul>
          </div>

        </div>

        {/* Programmatic SEO Section */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-10">
          <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Engineered For</p>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {['Product Managers', 'Software Architects', 'Creative Writers', 'Startup Founders', 'Research Scientists', 'Strategic Planners', 'Systems Thinkers'].map((role) => (
              <span key={role} className="px-3 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-full text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 hover:border-indigo-500/50 transition-colors cursor-default">
                {role}
              </span>
            ))}
          </div>
          <p className="mt-10 text-[10px] text-center text-slate-400">
            © {new Date().getFullYear()} Ideanodes Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
