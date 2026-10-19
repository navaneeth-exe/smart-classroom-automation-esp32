import React, { useState } from 'react';
import { Lightbulb, ShieldAlert, Power, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
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
 */

export default function PhysicalLedControl({
  data,
  isOnline,
  onSetLed,
  onSetLightMode,
}) {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const isLightOn = Boolean(data?.led);
  const autoLight = Boolean(data?.autoLight);

  const handleToggleLed = async (turnOn) => {
    setIsPending(true);
    setErrorMessage(null);
    try {
      await onSetLed(turnOn);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send LED command');
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
    <div className="bg-white/70 backdrop-blur-xl border border-stone-200/70 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header matching reference */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <Lightbulb className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">
              Physical LED (ESP32)
            </h3>
          </div>

          {/* Toggle Switch matching reference */}
          <button
            type="button"
            role="switch"
            disabled={!isOnline || isPending}
            aria-checked={isLightOn}
            onClick={() => handleToggleLed(!isLightOn)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors relative flex items-center disabled:opacity-40 ${
              isLightOn ? 'bg-[#4338ca]' : 'bg-stone-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                isLightOn ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Center: Genuine 3D Bulb Model + Status & Mode tiles */}
        <div className="grid grid-cols-2 items-center gap-3 my-2">
          {/* Genuine 3D Procedural Bulb (Three.js WebGL) */}
          <div className="relative aspect-square max-h-32 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-stone-50/60 to-amber-50/20 border border-stone-100">
            <Bulb3D
              isOn={isLightOn}
              isPending={isPending}
              isOnline={isOnline}
              height={125}
              className="w-full h-full"
            />
          </div>

          {/* Status & Mode cards matching reference */}
          <div className="space-y-2">
            {/* Status tile */}
            <div className="p-2.5 rounded-2xl bg-white/90 border border-stone-200/70 shadow-sm">
              <div className="text-[10px] text-stone-400 font-medium">Confirmed Status</div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900 mt-0.5">
                {isPending ? (
                  <>
                    <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                    <span className="text-amber-700">Updating...</span>
                  </>
                ) : !isOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-stone-300" />
                    <span className="text-stone-400">Offline</span>
                  </>
                ) : (
                  <>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isLightOn ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'
                      }`}
                    />
                    <span>{isLightOn ? 'ON (Confirmed)' : 'OFF (Confirmed)'}</span>
                  </>
                )}
              </div>
            </div>

            {/* Mode tile */}
            <button
              type="button"
              disabled={!isOnline || isPending}
              onClick={handleToggleAuto}
              className="w-full text-left p-2.5 rounded-2xl bg-white/90 border border-stone-200/70 shadow-sm hover:bg-stone-50 transition-colors flex items-center justify-between disabled:opacity-40"
            >
              <div>
                <div className="text-[10px] text-stone-400 font-medium">Mode</div>
                <div className="font-bold text-xs text-stone-900 mt-0.5">
                  {autoLight ? 'Auto' : 'Manual'}
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Error notification if command fails */}
        {errorMessage && (
          <div className="my-1.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Bottom Buttons matching reference */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
        <button
          type="button"
          disabled={!isOnline || isPending || !isLightOn}
          onClick={() => handleToggleLed(false)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span>Turn OFF</span>
        </button>

        <button
          type="button"
          disabled={!isOnline || isPending || isLightOn}
          onClick={() => handleToggleLed(true)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
          <span>Turn ON</span>
        </button>
      </div>
    </div>
  );
}
