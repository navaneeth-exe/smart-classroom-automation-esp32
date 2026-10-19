import React from 'react';
import { Thermometer, Droplets, Users, SunMedium, AlertTriangle } from 'lucide-react';

export default function EnvironmentGrid({ data, isOnline }) {
  const temp = data?.temperature;
  const hum = data?.humidity;
  const ldr = data?.ldr ?? '--';
  const occupied = Boolean(data?.occupied);
  const rawMotion = Boolean(data?.rawMotion);
  const isDark = Boolean(data?.dark);

  // Compute temp badge status
  let tempBadgeText = 'NORMAL';
  let tempBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (temp === null || temp === undefined || isNaN(temp)) {
    tempBadgeText = isOnline ? 'SENSOR ERROR' : 'DISCONNECTED';
    tempBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (temp >= (data?.highThreshold ?? 35)) {
    tempBadgeText = 'HIGH';
    tempBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (temp >= (data?.mediumThreshold ?? 30)) {
    tempBadgeText = 'WARM';
    tempBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Temperature Card */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-4 shadow-card hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold">
            <Thermometer className="w-5 h-5 text-brand-blue" />
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${tempBadgeClass}`}>
            {tempBadgeText}
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Temperature
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-900 my-1">
          {temp !== null && temp !== undefined && !isNaN(temp) ? Number(temp).toFixed(1) : '--'}
          <span className="text-sm font-semibold text-slate-400 ml-1">°C</span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">DHT22 sensor</div>
      </div>

      {/* 2. Humidity Card */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-4 shadow-card hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">
            SENSOR
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Relative Humidity
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-900 my-1">
          {hum !== null && hum !== undefined && !isNaN(hum) ? Math.round(hum) : '--'}
          <span className="text-sm font-semibold text-slate-400 ml-1">%</span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">DHT22 sensor</div>
      </div>

      {/* 3. Occupancy Card */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-4 shadow-card hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
              occupied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {occupied ? 'ACTIVE' : 'EMPTY'}
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Classroom Occupancy
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-900 my-1">
          {occupied ? 'Occupied' : 'Empty'}
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          {rawMotion
            ? 'Motion detected now'
            : occupied
            ? 'Motion detected recently'
            : 'No recent motion'}
        </div>
      </div>

      {/* 4. Ambient Light Card */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-4 shadow-card hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <SunMedium className="w-5 h-5 text-purple-600" />
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
              isDark
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {isDark ? 'LOW LIGHT' : 'BRIGHT'}
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Ambient Light
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-900 my-1">
          {ldr}
          <span className="text-xs font-semibold text-slate-400 ml-1">ADC</span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          {isDark ? 'Room is dark' : 'Room is bright'} (LDR)
        </div>
      </div>
    </section>
  );
}
