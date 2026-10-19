import React, { useState } from 'react';
import {
  Lightbulb,
  ShieldAlert,
  Power,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Zap,
  Sparkles,
  WifiOff,
  SunMedium,
  CheckCircle2,
} from 'lucide-react';
import Bulb3D from './Bulb3D';

/**
 * ==============================================================================
 * Physical LED Control (ESP32 GPIO 18) with Realistic 3D Bulb
 * ==============================================================================
 * Features:
 * - Genuine 3D procedural light bulb with glass envelope, metallic base, and filament
 * - Appearance strictly driven by confirmed ESP32 hardware state (data.led)
 * - Clear distinction between in-flight commands and confirmed hardware telemetry
 * - Error reporting when hardware is unreachable
 * - Direct control for ON/OFF and Auto/Manual modes
 * - Ambient light (LDR) sensor coupling diagnostics
 */

export default function PhysicalLedControl({
  data,
  isOnline = false,
  isStale = false,
  isConnecting = false,
  isTestMode = false,
  lastUpdated = null,
  onSetLed,
  onSetLightMode,
  className = '',
}) {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const isLightOn = Boolean(data?.led);
  const autoLight = Boolean(data?.autoLight);
  const ldrVal = data?.ldr;
  const isDark = Boolean(data?.dark);

  const handleToggleLed = async (turnOn) => {
    setIsPending(true);
    setErrorMessage(null);
    try {
      await onSetLed(turnOn);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send LED command to ESP32');
    } finally {
      setIsPending(false);
    }
  };

  const handleToggleAuto = async () => {
    setIsPending(true);
    setErrorMessage(null);
    try {
      await onSetLightMode(autoLight ? 'manual' : 'auto');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to change lighting mode');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section
      className={`relative rounded-3xl bg-white/75 backdrop-blur-xl border border-stone-200/80 shadow-glass overflow-hidden p-5 sm:p-6 transition-all flex flex-col justify-between ${className}`}
    >
      <div className="space-y-3.5">
        {/* Top Header: Title, Pin Badge & Hardware Switch */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-500 shadow-sm">
              <Lightbulb className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-stone-900 tracking-tight">
                  Physical LED (ESP32)
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium">
                <span>GPIO 18</span>
                <span>·</span>
                <span>Hardware Actuator</span>
              </div>
            </div>
          </div>

          {/* Prominent Quick-Toggle Switch */}
          <button
            type="button"
            role="switch"
            disabled={!isOnline || isPending}
            aria-checked={isLightOn}
            onClick={() => handleToggleLed(!isLightOn)}
            title={isLightOn ? 'Click to Turn OFF' : 'Click to Turn ON'}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors relative flex items-center disabled:opacity-40 shadow-inner ${
              isLightOn ? 'bg-[#4338ca]' : 'bg-stone-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                isLightOn ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Telemetry Status Bar */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5">
            {isPending ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Command In-Flight...
              </span>
            ) : isTestMode ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="w-3 h-3" />
                Test Fixture
              </span>
            ) : !isOnline ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <WifiOff className="w-3 h-3" />
                Hardware Offline
              </span>
            ) : isStale ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Stale Telemetry
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live ESP32 Synced
              </span>
            )}
          </div>

          <span className="text-[10px] text-stone-400 font-mono">
            {lastUpdated ? `${Math.max(0, Math.floor((Date.now() - new Date(lastUpdated)) / 1000))}s ago` : 'Active'}
          </span>
        </div>

        {/* 3D WebGL Bulb Stage */}
        <div className="relative rounded-2xl min-h-[170px] sm:min-h-[190px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#fdfbf7] via-[#f7f4ed] to-[#ede7dc]/60 border border-stone-200/70 shadow-inner">
          {/* Warm architectural sunlight halo behind bulb */}
          <div
            className={`absolute inset-0 bg-amber-300/30 blur-2xl transition-opacity duration-700 pointer-events-none ${
              isLightOn ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <Bulb3D
            isOn={isLightOn}
            isPending={isPending}
            isOnline={isOnline}
            height={165}
            className="w-full max-w-[260px] mx-auto z-10"
          />

          {/* Floating Subtle Stage Badge */}
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/85 backdrop-blur-md border border-stone-200/80 shadow-sm text-[10px]">
            <span className="text-stone-400 font-medium">Bulb State:</span>
            <span className="font-bold text-stone-800">
              {isLightOn ? 'Illuminated' : 'Extinguished'}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLightOn ? 'bg-amber-400 animate-pulse' : 'bg-stone-300'
              }`}
            />
          </div>
        </div>

        {/* Confirmed State & Operating Mode Tiles */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Confirmed Hardware State Tile */}
          <div className="p-3 rounded-2xl bg-white/90 border border-stone-200/70 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
              Confirmed State
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-black text-sm text-stone-900 tracking-tight">
              {isPending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin flex-shrink-0" />
                  <span className="text-amber-700 text-xs">Updating...</span>
                </>
              ) : !isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-stone-300 flex-shrink-0" />
                  <span className="text-stone-400 text-xs">Offline</span>
                </>
              ) : (
                <>
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isLightOn ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'
                    }`}
                  />
                  <span>{isLightOn ? 'ON (Confirmed)' : 'OFF (Confirmed)'}</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-stone-400 mt-1">
              {isLightOn ? 'Active 3.3V GPIO signal' : 'Line low / unpowered'}
            </div>
          </div>

          {/* Operating Mode Tile */}
          <button
            type="button"
            disabled={!isOnline || isPending}
            onClick={handleToggleAuto}
            className="p-3 rounded-2xl bg-white/90 border border-stone-200/70 shadow-sm hover:bg-stone-50 transition-colors flex flex-col justify-between text-left disabled:opacity-40"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                Mode
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div className="font-black text-sm text-stone-900 tracking-tight mt-1">
              {autoLight ? 'Auto (LDR)' : 'Manual Hold'}
            </div>
            <div className="text-[10px] text-stone-400 mt-1">
              {autoLight ? 'Governed by light level' : 'Manual control active'}
            </div>
          </button>
        </div>

        {/* Ambient Light Sensor Coupling Information */}
        <div className="p-2.5 rounded-2xl bg-stone-50/80 border border-stone-200/70 flex items-center justify-between text-[11px] text-stone-600">
          <div className="flex items-center gap-1.5">
            <SunMedium className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-stone-700">Ambient Sensor:</span>
            <span>{ldrVal !== null && ldrVal !== undefined ? `${ldrVal} lux` : '--'}</span>
          </div>
          <span className="text-[10px] font-medium text-stone-400">
            {isDark ? 'Dark (Triggers Auto ON)' : 'Bright (Auto OFF)'}
          </span>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Bottom Direct Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-3.5 border-t border-stone-100 mt-3">
        <button
          type="button"
          disabled={!isOnline || isPending || !isLightOn}
          onClick={() => handleToggleLed(false)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span>Turn OFF</span>
        </button>

        <button
          type="button"
          disabled={!isOnline || isPending || isLightOn}
          onClick={() => handleToggleLed(true)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>Turn ON</span>
        </button>
      </div>
    </section>
  );
}
