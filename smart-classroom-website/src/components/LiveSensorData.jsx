import React from 'react';
import { Thermometer, Droplets, Sun, Activity, TrendingUp, TrendingDown, Users } from 'lucide-react';

export default function LiveSensorData({
  data,
  isOnline,
  isConnecting,
  isTestMode,
  layout = 'row',
}) {
  const temp = data?.temperature;
  const hum = data?.humidity;
  const ldr = data?.ldr;
  const rawMotion = data?.rawMotion;
  const occupied = data?.occupied;
  const darkRoom = data?.dark;

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-stone-200/70 rounded-3xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <Activity className="w-4 h-4 text-stone-600" />
          Live Sensor Data
        </h3>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isTestMode ? 'Test Fixture' : isOnline ? 'From ESP32' : 'Offline'}</span>
        </div>
      </div>

      {/* Grid or Row layout */}
      <div className={layout === 'row' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3' : 'grid grid-cols-2 gap-3'}>
        {/* 1. Temperature */}
        <div className="p-3.5 rounded-2xl bg-white/80 border border-stone-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-studio-terracotta">
              <Thermometer className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-stone-900 tracking-tight">
            {isConnecting ? (
              <span className="text-stone-300 text-sm font-normal">--</span>
            ) : temp !== null && temp !== undefined && !isNaN(temp) ? (
              `${Number(temp).toFixed(1)} °C`
            ) : (
              '--'
            )}
          </div>
          <div className="text-[11px] font-medium text-stone-400">Temperature</div>

          {/* Mini trend sparkline */}
          <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 mt-2 pt-1 border-t border-stone-100">
            <TrendingUp className="w-3 h-3 text-orange-500" />
            <span>+0.6°</span>
            <svg className="w-12 h-3 ml-auto text-orange-400" viewBox="0 0 50 12" fill="none">
              <path d="M0 10 L15 8 L30 5 L50 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 2. Humidity */}
        <div className="p-3.5 rounded-2xl bg-white/80 border border-stone-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-studio-ocean">
              <Droplets className="w-4 h-4 text-sky-500" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-stone-900 tracking-tight">
            {isConnecting ? (
              <span className="text-stone-300 text-sm font-normal">--</span>
            ) : hum !== null && hum !== undefined && !isNaN(hum) ? (
              `${Math.round(hum)} %`
            ) : (
              '--'
            )}
          </div>
          <div className="text-[11px] font-medium text-stone-400">Humidity</div>

          {/* Mini trend sparkline */}
          <div className="flex items-center gap-1 text-[10px] font-bold text-sky-600 mt-2 pt-1 border-t border-stone-100">
            <TrendingDown className="w-3 h-3 text-sky-500" />
            <span>-1%</span>
            <svg className="w-12 h-3 ml-auto text-sky-400" viewBox="0 0 50 12" fill="none">
              <path d="M0 3 L18 6 L35 7 L50 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 3. Light Level */}
        <div className="p-3.5 rounded-2xl bg-white/80 border border-stone-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
              <Sun className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-stone-900 tracking-tight">
            {isConnecting ? (
              <span className="text-stone-300 text-sm font-normal">--</span>
            ) : ldr !== null && ldr !== undefined ? (
              ldr
            ) : (
              '--'
            )}
          </div>
          <div className="text-[11px] font-medium text-stone-400">Light Level</div>

          {/* Subtext info */}
          <div className="flex items-center justify-between text-[10px] font-medium text-amber-700 mt-2 pt-1 border-t border-stone-100">
            <span>{darkRoom ? 'Dim Environment' : 'Bright Environment'}</span>
            <svg className="w-10 h-3 text-amber-400" viewBox="0 0 40 12" fill="none">
              <path d="M0 8 Q10 2 20 6 T40 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 4. Motion */}
        <div className="p-3.5 rounded-2xl bg-white/80 border border-stone-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-stone-900 tracking-tight">
            {rawMotion ? 'Detected' : occupied ? 'Occupied' : 'Clear'}
          </div>
          <div className="text-[11px] font-medium text-stone-400">Motion</div>

          {/* Subtext info */}
          <div className="flex items-center justify-between text-[10px] font-medium text-emerald-700 mt-2 pt-1 border-t border-stone-100">
            <span>{occupied ? 'Room Occupied' : 'Room Vacant'}</span>
            <svg className="w-10 h-3 text-emerald-400" viewBox="0 0 40 12" fill="none">
              <path d="M0 6 L12 3 L25 8 L40 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
