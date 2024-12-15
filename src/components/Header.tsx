import React from 'react';
import { Brain, Github } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Brain className="w-8 h-8" />
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">AI Agent Management</h1>
            <p className="text-indigo-100 text-sm sm:text-base mt-0.5">Created by Benoit Corvol</p>
          </div>
        </div>
        <a
          href="https://github.com/benoitcor"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm sm:text-base"
        >
          <Github className="w-5 h-5" />
          <span>GitHub</span>
        </a>
      </div>
    </header>
  );
}