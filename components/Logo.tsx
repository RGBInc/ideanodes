import React from 'react';

export const Logo = ({ className = "w-8 h-8", textSize = "text-2xl" }: { className?: string, textSize?: string }) => (
  <div className={`font-serif font-bold tracking-tighter flex items-start leading-none ${textSize} ${className}`}>
    <span>I</span>
    <sup className="text-[0.6em] mt-1">d</sup>
  </div>
);
