import React from 'react';
import { Wifi, WifiOff, Settings, Sparkles, RefreshCw } from 'lucide-react';

export default function Navbar({
  isOnline,
  isConnecting,
  baseUrl,
  isMockMode,
  latencyMs,
  onOpenSettings,
  onRefresh,
}) {
  return (
    <header className="bg-navy-900 text-white px-4 sm:px-8 py-4 shadow-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center font-bold text-xl shadow-glow">
            ⌘
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">ClassroomOS</h1>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wider">
              SMART CLASSROOM AUTOMATION
            </p>
          </div>
        </div>

        {/* Right status and controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            title="Refresh telemetry"
            className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
          </button>

          {/* Connection Status Pill */}
          <div
            onClick={onOpenSettings}
            className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
              isMockMode
                ? 'bg-purple-900/60 text-purple-200 border border-purple-500/40'
                : isOnline
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
            }`}
          >
            {isMockMode ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>DEMO SIMULATION</span>
              </>
            ) : isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>ONLINE {latencyMs ? `(${latencyMs}ms)` : ''}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span>OFFLINE</span>
              </>
            )}
          </div>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="API & Connection Settings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
