import React, { useState, useEffect } from 'react';
import { Sun, Building2, ChevronDown, RefreshCw, Sparkles } from 'lucide-react';

export default function Header({
  userName = 'Kai',
  roomName = 'Classroom 1',
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

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
      {/* Left Title and Breadcrumbs */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-1">
          <Building2 className="w-3.5 h-3.5 text-stone-400" />
          <span>{roomName}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {greeting}, {userName}
        </h1>

        <p className="text-xs text-stone-400 font-medium mt-0.5">
          Monitored · Automated · Comfortable Learning Environment
        </p>
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
