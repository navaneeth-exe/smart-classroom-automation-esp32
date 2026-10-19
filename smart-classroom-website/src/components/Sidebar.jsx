import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Cpu,
  Zap,
  BarChart3,
  Settings,
  Wifi,
  WifiOff,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({
  activePage,
  onNavigate,
  isOnline,
  isTestMode,
  baseUrl,
  lastUpdated,
}) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastUpdated) {
        const sec = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
        setSecondsAgo(Math.max(0, sec));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'devices', label: 'Devices', icon: Cpu },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const cleanIp = baseUrl.replace(/^https?:\/\//, '').split(':')[0];

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col justify-between p-4 bg-white/70 backdrop-blur-xl border border-stone-200/70 rounded-3xl shadow-sm">
      {/* Top Brand Logo */}
      <div>
        <div className="flex items-center gap-2.5 px-3 py-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-400 via-indigo-400 to-sky-300 shadow-sm flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-white/80" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-stone-900 tracking-tight leading-tight">
              Smart Classroom
            </div>
            <div className="text-[9px] font-bold text-stone-400 tracking-widest uppercase">
              STUDIO
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#e0e7ff]/70 text-[#3730a3] font-bold shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#4338ca]' : 'text-stone-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Device Status Card */}
      <div className="p-3 rounded-2xl bg-white/90 border border-stone-200/80 shadow-sm">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              isTestMode
                ? 'bg-purple-100 text-purple-700'
                : isOnline
                ? 'bg-sky-50 text-sky-600'
                : 'bg-rose-50 text-rose-500'
            }`}
          >
            {isTestMode ? (
              <Sparkles className="w-3.5 h-3.5" />
            ) : isOnline ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isTestMode
                    ? 'bg-purple-500'
                    : isOnline
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              <span className="truncate">
                {isTestMode ? 'Test Mode' : isOnline ? 'ESP32 Online' : 'ESP32 Offline'}
              </span>
            </div>
            <div className="text-[10px] font-mono text-stone-400 truncate">
              {cleanIp || '192.168.4.1'}
            </div>
          </div>
        </div>

        <div className="text-[10px] text-stone-400 pt-1.5 border-t border-stone-100 flex justify-between">
          <span>Last update</span>
          <span className="font-medium text-stone-600">
            {isOnline ? `${secondsAgo}s ago` : 'Unavailable'}
          </span>
        </div>
      </div>
    </aside>
  );
}
