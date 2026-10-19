import React from 'react';
import {
  Fan,
  Thermometer,
  Power,
  Wind,
  Gauge,
  Sparkles,
  Wifi,
  WifiOff,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import CeilingFan3D from './CeilingFan3D';
import { calculateVirtualFanMode, DEFAULT_FAN_THRESHOLDS } from '../utils/fanAutomation';

/**
 * ==============================================================================
 * Smart Classroom Studio — Virtual Fan Hero Studio
 * ==============================================================================
 * Dominant interactive showcase connecting real ESP32 temperature telemetry
 * to an interactive 3D WebGL ceiling fan with smooth inertia and automatic speed tiers.
 */

export default function VirtualFanHero({
  temperature,
  virtualFanMode = 'OFF',
  virtualFanAuto = true,
  fanThresholds = DEFAULT_FAN_THRESHOLDS,
  isOnline = false,
  isStale = false,
  isConnecting = false,
  isTestMode = false,
  lastUpdated = null,
  onSetManualSpeed,
  onReturnToAuto,
  className = '',
}) {
  const hasValidTemp =
    temperature !== null &&
    temperature !== undefined &&
    !isNaN(temperature);

  // Dynamic explanation text derived from pure automation calculation
  const fanCalc = calculateVirtualFanMode(temperature, fanThresholds);

  let explanationText = '';
  if (virtualFanAuto) {
    if (!hasValidTemp) {
      explanationText = isOnline
        ? 'Awaiting temperature sensor sample from ESP32 (GPIO 4)...'
        : 'Microcontroller offline. Connect to Wi-Fi access point "smart" to stream live temperature.';
    } else if (fanCalc.mode === 'OFF') {
      explanationText = `Temperature (${Number(temperature).toFixed(1)}°C) is below the activation threshold (${fanThresholds.slow}°C). Fan is idle.`;
    } else if (fanCalc.mode === 'LOW') {
      explanationText = `Mild temperature detected (${Number(temperature).toFixed(1)}°C). Fan circulating air at gentle LOW speed.`;
    } else if (fanCalc.mode === 'MEDIUM') {
      explanationText = `Warm temperature detected (${Number(temperature).toFixed(1)}°C). Fan operating at balanced MEDIUM speed.`;
    } else {
      explanationText = `Elevated temperature detected (${Number(temperature).toFixed(1)}°C). Fan running at maximum HIGH speed.`;
    }
  } else {
    explanationText = `Manual override active. Visual fan speed fixed to ${virtualFanMode} (ignoring ${
      hasValidTemp ? `${Number(temperature).toFixed(1)}°C` : 'temperature'
    }).`;
  }

  // Active speed bars (0 to 4)
  let activeBars = 0;
  if (virtualFanMode === 'LOW') activeBars = 1;
  else if (virtualFanMode === 'MEDIUM') activeBars = 3;
  else if (virtualFanMode === 'HIGH') activeBars = 4;

  const speedButtons = [
    { id: 'OFF', label: 'Off', icon: Power },
    { id: 'LOW', label: 'Low', icon: Wind },
    { id: 'MEDIUM', label: 'Medium', icon: Fan },
    { id: 'HIGH', label: 'High', icon: Gauge },
  ];

  return (
    <section className={`relative w-full rounded-3xl bg-white/75 backdrop-blur-xl border border-stone-200/80 shadow-glass overflow-hidden p-5 sm:p-7 transition-all flex flex-col justify-between ${className}`}>
      {/* Top Banner / Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4338ca] shadow-sm">
            <Fan className="w-4 h-4 text-[#4338ca] animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                Virtual Fan Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-[#4338ca] border border-indigo-200/60">
                Hero Showcase
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
              Interactive 3D airflow simulation automatically governed by real ESP32 temperature telemetry
            </p>
          </div>
        </div>

        {/* Telemetry Source Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-white/90 border border-stone-200 text-xs shadow-sm">
            {isTestMode ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-bold text-purple-900 text-[11px]">Test Fixture</span>
              </>
            ) : isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-stone-800 text-[11px]">Live ESP32</span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {lastUpdated ? `${Math.max(0, Math.floor((Date.now() - new Date(lastUpdated)) / 1000))}s ago` : 'Active'}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold text-amber-800 text-[11px]">ESP32 Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Showcase Layout: Left 3D Stage (Dominant ~58%) & Right Telemetry & Controls (~42%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center py-4 flex-1">
        {/* =====================================================================
            1. DOMINANT 3D VIRTUAL FAN STAGE (lg:col-span-7)
            ===================================================================== */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-center justify-center relative min-h-[340px] sm:min-h-[390px] rounded-3xl bg-gradient-to-b from-[#fdfbf7] via-[#f7f4ed] to-[#ede7dc]/60 border border-stone-200/70 shadow-inner overflow-hidden">
          {/* Warm architectural sunlight aura behind fan */}
          <div className="absolute -top-10 left-1/3 w-80 h-80 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 right-1/4 w-72 h-72 rounded-full bg-purple-200/15 blur-3xl pointer-events-none" />

          {/* Interactive 3D Ceiling Fan Canvas */}
          <CeilingFan3D
            mode={virtualFanMode}
            isAuto={virtualFanAuto}
            height={370}
            className="w-full max-w-[540px] mx-auto z-10"
          />

          {/* Floating Subtle Fan Badge */}
          <div className="absolute top-3 left-3.5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/85 backdrop-blur-md border border-stone-200/80 shadow-sm text-xs">
            <span className="text-stone-400 font-medium">3D Assembly:</span>
            <span className="font-bold text-stone-800">
              {virtualFanMode === 'OFF' ? 'Idle' : `Spinning (${virtualFanMode})`}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* =====================================================================
            2. TELEMETRY, AUTOMATION STATUS & CONTROLS (lg:col-span-5)
            ===================================================================== */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-between space-y-3.5">
          {/* Prominent Temperature Display Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/90 border border-stone-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-600">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <span>ESP32 Temperature Input</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  virtualFanAuto
                    ? 'bg-purple-50 text-[#4338ca] border-purple-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {virtualFanAuto ? 'AUTO PILOT' : 'MANUAL HOLD'}
              </span>
            </div>

            {/* Giant Temperature Metric */}
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight">
                {hasValidTemp ? Number(temperature).toFixed(1) : '--'}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-stone-400">°C</span>

              <div className="ml-auto text-right">
                <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                  Target Speed
                </div>
                <div className="text-xl font-black text-stone-900 tracking-tight">
                  {virtualFanMode}
                </div>
              </div>
            </div>

            {/* 4-Bar Dynamic Speed Meter */}
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-stone-500">Airflow Velocity:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((barIndex) => (
                  <div
                    key={barIndex}
                    className={`h-3 w-5 rounded-full transition-all duration-300 ${
                      barIndex <= activeBars
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'bg-stone-200/80'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Dynamic Status Explanation Banner */}
            <div className="mt-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs text-stone-600 leading-relaxed flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{explanationText}</span>
            </div>
          </div>

          {/* Virtual Fan Operating Controls */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/90 border border-stone-200/80 shadow-sm space-y-3">
            {/* Auto vs Manual Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">Control Mode</span>
              <div className="inline-flex p-1 rounded-2xl bg-stone-100 border border-stone-200 text-xs">
                <button
                  type="button"
                  onClick={onReturnToAuto}
                  className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-all ${
                    virtualFanAuto
                      ? 'bg-white text-[#4338ca] shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  AUTO
                </button>
                <button
                  type="button"
                  onClick={() => onSetManualSpeed(virtualFanMode === 'OFF' ? 'LOW' : virtualFanMode)}
                  className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-all ${
                    !virtualFanAuto
                      ? 'bg-white text-amber-800 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  MANUAL
                </button>
              </div>
            </div>

            {/* Speed Buttons Row */}
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mb-1.5">
                Speed Selection {!virtualFanAuto ? '(Manual Override)' : '(Preview)'}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {speedButtons.map((btn) => {
                  const Icon = btn.icon;
                  const isActive = virtualFanMode === btn.id;
                  return (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => onSetManualSpeed(btn.id)}
                      className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all active:scale-95 ${
                        isActive
                          ? 'bg-[#4338ca] text-white border-[#4338ca] shadow-md shadow-indigo-100'
                          : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[11px]">{btn.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Configured Thresholds Legend */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
              <span>Thresholds:</span>
              <span className="font-mono text-stone-600">
                Low: {fanThresholds.slow}°C · Med: {fanThresholds.medium}°C · High: {fanThresholds.high}°C
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
