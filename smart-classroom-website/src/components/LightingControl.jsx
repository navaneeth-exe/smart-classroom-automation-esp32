import React from 'react';
import { Lightbulb, Sun, Zap, ZapOff } from 'lucide-react';

export default function LightingControl({
  data,
  onToggleLightAuto,
  onSetLedState,
}) {
  const isLightOn = Boolean(data?.led);
  const autoLight = Boolean(data?.autoLight);
  const occupied = Boolean(data?.occupied);
  const darkRoom = Boolean(data?.dark);
  const rawMotion = Boolean(data?.rawMotion);

  // Compute status reason text
  let reasonText = 'Waiting for telemetry...';
  if (autoLight) {
    if (occupied && darkRoom) {
      reasonText = 'Motion detected · Low light';
    } else if (!occupied) {
      reasonText = 'No recent motion (Room vacant)';
    } else if (!darkRoom) {
      reasonText = 'Room is bright (Natural light sufficient)';
    }
  } else {
    reasonText = 'Manual control override active';
  }

  return (
    <div className="bg-surface border border-slate-200/80 rounded-2xl p-5 shadow-card flex flex-col justify-between">
      <div>
        {/* Title */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Lighting Control
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Motion and brightness automation
            </p>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
              autoLight
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}
          >
            {autoLight ? 'AUTO' : 'MANUAL'}
          </span>
        </div>

        {/* Bulb Indicator Summary */}
        <div className="flex items-center gap-4 py-2 mb-3">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
              isLightOn
                ? 'bg-amber-100 text-amber-500 shadow-bulb scale-105 border border-amber-300'
                : 'bg-slate-100 text-slate-400 border border-slate-200'
            }`}
          >
            <Lightbulb
              className={`w-8 h-8 ${isLightOn ? 'fill-amber-400 text-amber-500' : ''}`}
            />
          </div>

          <div>
            <div
              className={`text-xl font-bold tracking-tight ${
                isLightOn ? 'text-emerald-700' : 'text-slate-700'
              }`}
            >
              {isLightOn ? 'Light is ON' : 'Light is OFF'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{reasonText}</div>
          </div>
        </div>

        {/* PIR Motion Status Row */}
        <div className="flex items-center justify-between py-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">PIR Motion Sensor</div>
              <div className="text-[11px] text-slate-500">Classroom presence</div>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
              rawMotion
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : occupied
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {rawMotion ? 'MOTION NOW' : occupied ? 'RECENT' : 'IDLE'}
          </span>
        </div>

        {/* Automatic Lighting Toggle Row */}
        <div className="flex items-center justify-between py-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Automatic Lighting</div>
              <div className="text-[11px] text-slate-500">
                Turn ON only when occupied AND room is dark
              </div>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={autoLight}
            onClick={onToggleLightAuto}
            className={`w-12 h-7 rounded-full p-1 transition-colors relative flex items-center ${
              autoLight ? 'bg-brand-blue' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                autoLight ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Manual Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={() => onSetLedState(true)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            Turn Light ON
          </button>

          <button
            type="button"
            onClick={() => onSetLedState(false)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <ZapOff className="w-3.5 h-3.5" />
            Turn Light OFF
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 mt-4 italic">
        Manual LED buttons override automatic mode. Physical LED pin: D6 (NodeMCU) / GPIO 18 (ESP32).
      </p>
    </div>
  );
}
