import React, { useState } from 'react';
import { Lightbulb, ShieldAlert, Power, ChevronRight, RefreshCw } from 'lucide-react';

export default function PhysicalLedControl({
  data,
  isOnline,
  onSetLed,
  onSetLightMode,
}) {
  const [isPending, setIsPending] = useState(false);

  const isLightOn = Boolean(data?.led);
  const autoLight = Boolean(data?.autoLight);

  const handleToggleLed = async (turnOn) => {
    setIsPending(true);
    await onSetLed(turnOn);
    setIsPending(false);
  };

  const handleToggleAuto = async () => {
    setIsPending(true);
    await onSetLightMode(autoLight ? 'manual' : 'auto');
    setIsPending(false);
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

        {/* Center: Glowing bulb asset + Status & Mode tiles */}
        <div className="grid grid-cols-2 items-center gap-3 my-2">
          {/* Glowing Bulb Visual */}
          <div className="relative aspect-square max-h-28 flex items-center justify-center p-1">
            {/* Ambient circular filament glow matching reference */}
            {isLightOn && (
              <div className="absolute w-20 h-20 rounded-full bg-amber-400/35 blur-xl pointer-events-none animate-pulse" />
            )}
            <div
              className={`w-24 h-24 flex items-center justify-center transition-all duration-500 relative z-10 ${
                isLightOn ? 'opacity-100' : 'opacity-40 grayscale'
              }`}
            >
              <img
                src="/bulb.jpg"
                alt="Physical LED Lamp"
                className="w-full h-full object-contain mix-blend-multiply pointer-events-none"
              />
            </div>
          </div>

          {/* Status & Mode cards matching reference */}
          <div className="space-y-2">
            {/* Status tile */}
            <div className="p-2.5 rounded-2xl bg-white/90 border border-stone-200/70 shadow-sm">
              <div className="text-[10px] text-stone-400 font-medium">Status</div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLightOn ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'
                  }`}
                />
                <span>{isLightOn ? 'ON' : 'OFF'}</span>
              </div>
            </div>

            {/* Mode tile */}
            <button
              type="button"
              onClick={handleToggleAuto}
              className="w-full text-left p-2.5 rounded-2xl bg-white/90 border border-stone-200/70 shadow-sm hover:bg-stone-50 transition-colors flex items-center justify-between"
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
      </div>

      {/* Bottom Buttons matching reference */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
        <button
          type="button"
          disabled={!isOnline || isPending}
          onClick={() => handleToggleLed(false)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span>Turn OFF</span>
        </button>

        <button
          type="button"
          disabled={!isOnline || isPending}
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
