import React, { useState } from 'react';
import { BarChart3, Clock, TrendingUp, Thermometer, Droplets, Sun, Activity } from 'lucide-react';
import SensorChart from '../components/SensorChart';

export default function Insights({ sensorHistory = [], activityLog = [] }) {
  // Compute summary stats from collected history
  const validTemps = sensorHistory.map((s) => s.temperature).filter((t) => t !== null && !isNaN(t));
  const validHums = sensorHistory.map((s) => s.humidity).filter((h) => h !== null && !isNaN(h));
  const validLdrs = sensorHistory.map((s) => s.ldr).filter((l) => l !== null && !isNaN(l));

  const avgTemp = validTemps.length > 0 ? (validTemps.reduce((a, b) => a + b, 0) / validTemps.length).toFixed(1) : '--';
  const minTemp = validTemps.length > 0 ? Math.min(...validTemps).toFixed(1) : '--';
  const maxTemp = validTemps.length > 0 ? Math.max(...validTemps).toFixed(1) : '--';

  const avgHum = validHums.length > 0 ? Math.round(validHums.reduce((a, b) => a + b, 0) / validHums.length) : '--';
  const avgLdr = validLdrs.length > 0 ? Math.round(validLdrs.reduce((a, b) => a + b, 0) / validLdrs.length) : '--';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-studio-ocean" />
          Classroom Analytics & Session Insights
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Historical sensor trends recorded sequentially during the current application session
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
            <Thermometer className="w-4 h-4 text-orange-500" />
            <span>Avg Session Temp</span>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {avgTemp !== '--' ? `${avgTemp} °C` : '--'}
          </div>
          <div className="text-[10px] text-stone-400 mt-1 flex justify-between">
            <span>Min: {minTemp}°C</span>
            <span>Max: {maxTemp}°C</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
            <Droplets className="w-4 h-4 text-sky-500" />
            <span>Avg Humidity</span>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {avgHum !== '--' ? `${avgHum} %` : '--'}
          </div>
          <div className="text-[10px] text-stone-400 mt-1">Relative moisture level</div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Avg Light Level</span>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {avgLdr !== '--' ? `${avgLdr} ADC` : '--'}
          </div>
          <div className="text-[10px] text-stone-400 mt-1">Ambient brightness</div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Recorded Samples</span>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">{sensorHistory.length}</div>
          <div className="text-[10px] text-stone-400 mt-1">Live buffer entries</div>
        </div>
      </div>

      {/* Recharts Chart Component */}
      <SensorChart history={sensorHistory} />

      {/* Comprehensive Event Log */}
      <div className="glass-card rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-2">
          <Clock className="w-4 h-4 text-stone-600" />
          Full Session Event Log
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          Complete audit trail of hardware triggers, fan mode transitions, and network state changes
        </p>

        {activityLog.length === 0 ? (
          <div className="py-10 text-center text-xs text-stone-400">
            No events recorded yet. Connect to hardware to start capturing activity.
          </div>
        ) : (
          <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
            {activityLog.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      log.category === 'hardware'
                        ? 'bg-amber-50 text-amber-800'
                        : log.category === 'virtual'
                        ? 'bg-blue-50 text-blue-800'
                        : log.category === 'connection'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {log.category}
                  </span>
                  <span className="font-semibold text-stone-800 truncate">{log.message}</span>
                </div>
                <span className="text-[11px] font-mono text-stone-400 whitespace-nowrap ml-4">
                  {new Date(log.time).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
