import React, { useState, useEffect } from 'react';
import {
  Sun,
  Building2,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Activity,
} from 'lucide-react';

export default function Header({
  roomName = 'Classroom 1',
  data,
  isOnline,
  isTestMode,
  onRefresh,
  isRefreshing,
}) {
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
      setCurrentTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isOccupied = Boolean(data?.occupied);
  const temp = data?.temperature;
  const isLightOn = Boolean(data?.led);

  // Dynamic high-level classroom health summary
  let envStatusText = 'Autonomous Environment Governance Active';
  if (!isOnline && !isTestMode) {
    envStatusText = 'ESP32 Gateway Offline · Microcontroller Unreachable';
  } else if (temp !== null && temp !== undefined) {
    const climateStr =
      temp < 25 ? 'Mild Climate' : temp > 29 ? 'Elevated Temp' : 'Optimal Climate';
    const occStr = isOccupied ? 'Occupied' : 'Vacant';
    const lightStr = isLightOn ? 'LED Active' : 'Lighting Conserved';
    envStatusText = `${occStr} · ${climateStr} (${Number(temp).toFixed(1)}°C) · ${lightStr}`;
  }

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
      {/* Left Title and Real-Time Operational Context */}
      <div>
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-1">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-semibold text-stone-700">{roomName}</span>
          </div>
          <span className="text-stone-300">/</span>
          <span className="text-stone-400">IoT Operations Center</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Classroom Automation Studio
          </h1>

          {/* Real-time System Status Pill */}
          {!isOnline && !isTestMode ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Gateway Offline
            </span>
          ) : isTestMode ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-xs">
              <Sparkles className="w-3 h-3 text-purple-600" />
              Simulation Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Systems Nominal
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mt-1">
          <Activity className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
          <span>{envStatusText}</span>
        </div>
      </div>

      {/* Right Capsules */}
      <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          title="Refresh real-time data"
          className="p-2.5 rounded-2xl bg-white/80 hover:bg-white text-stone-500 hover:text-stone-900 border border-stone-200/80 shadow-sm transition-all active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Live Weather / Time Capsule */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-sm text-xs">
          <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
            <Sun className="w-4 h-4 fill-amber-400" />
          </div>
          <div className="text-left">
            <div className="text-[10px] text-stone-400 font-semibold leading-tight">
              {currentDateStr || 'Today'}
            </div>
            <div className="font-extrabold text-stone-800 tracking-tight">
              {currentTimeStr || '10:00 AM'}
            </div>
          </div>
        </div>

        {/* Room Selector Capsule */}
        <button
          type="button"
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-sm text-xs font-semibold text-stone-700 hover:bg-white transition-all"
        >
          <Building2 className="w-4 h-4 text-stone-500" />
          <span>{roomName}</span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-1" />
        </button>
      </div>
    </header>
  );
}
