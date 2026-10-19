import React from 'react';
import { Sun, Sparkles } from 'lucide-react';

export default function Hero({ isMockMode, onToggleMock }) {
  return (
    <section className="bg-gradient-to-r from-[#243b79] via-[#536dfe] to-[#8091ff] text-white rounded-2xl p-6 sm:p-7 shadow-lg mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-[0.15em] text-blue-200 uppercase">
            CLASSROOM / OVERVIEW
          </span>
          {isMockMode && (
            <span className="bg-purple-900/60 text-purple-200 border border-purple-400/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
              Simulation Mode
            </span>
          )}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5 mb-1 text-white">
          A smarter space to learn.
        </h2>
        <p className="text-sm text-blue-100 max-w-xl">
          Monitor your classroom environment in real-time and explore intelligent automation controls.
        </p>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/20">
          <Sun className="w-8 h-8 text-amber-300 animate-spin" style={{ animationDuration: '30s' }} />
        </div>
      </div>
    </section>
  );
}
