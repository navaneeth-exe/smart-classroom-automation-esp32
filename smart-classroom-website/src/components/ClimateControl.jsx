import React from 'react';
import { Fan, RefreshCw, Cpu } from 'lucide-react';

export default function ClimateControl({ data, onSelectFanSpeed, onToggleFanAuto }) {
  const fanMode = data?.fanMode || 'OFF';
  const fanAuto = Boolean(data?.fanAuto);
  const fanPercent = data?.fanPercent ?? 0;
  const temp = data?.temperature;

  // Animation speed based on fanMode
  let spinClass = '';
  if (fanMode === 'SLOW') spinClass = 'fan-spin-slow';
  else if (fanMode === 'MEDIUM') spinClass = 'fan-spin-medium';
  else if (fanMode === 'HIGH') spinClass = 'fan-spin-high';

  return (
    <div className="bg-surface border border-slate-200/80 rounded-2xl p-5 shadow-card flex flex-col justify-between">
      {/* Title */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Fan className="w-4 h-4 text-brand-blue" />
              Climate Control
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Temperature-based virtual fan simulation
            </p>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
              fanAuto
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}
          >
            {fanAuto ? 'AUTO MODE' : 'MANUAL MODE'}
          </span>
        </div>

        {/* Fan visual representation */}
        <div className="flex items-center gap-4 py-2 mb-3">
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-blue-50 to-indigo-100/70 border border-blue-200/60 flex items-center justify-center flex-shrink-0 shadow-inner">
            <Fan
              className={`w-10 h-10 text-brand-blue transition-all ${spinClass}`}
            />
            {fanMode !== 'OFF' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>

          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {fanMode}
            </div>
            <div className="text-xs text-slate-500">
              {fanAuto ? 'Dynamic based on DHT22 temperature' : 'Manual override active'}
            </div>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <Cpu className="w-3 h-3" />
              <span>
                {temp !== null && temp !== undefined && !isNaN(temp)
                  ? `${Number(temp).toFixed(1)} °C`
                  : 'Sensor check'}
              </span>
            </div>
          </div>
        </div>

        {/* Speed Track */}
        <div className="my-3">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 rounded-full"
              style={{ width: `${fanPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1.5">
            <span>0% (OFF)</span>
            <span>33% (SLOW)</span>
            <span>66% (MED)</span>
            <span>100% (HIGH)</span>
          </div>
        </div>

        {/* Manual Speed Buttons */}
        <div className="grid grid-cols-4 gap-2 my-4">
          {['OFF', 'SLOW', 'MEDIUM', 'HIGH'].map((speed) => {
            const isSelected = !fanAuto && fanMode === speed;
            return (
              <button
                key={speed}
                type="button"
                onClick={() => onSelectFanSpeed(speed)}
                className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {speed}
              </button>
            );
          })}
        </div>

        {/* Auto Fan Toggle Row */}
        <div className="flex items-center justify-between py-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Automatic Fan</div>
              <div className="text-[11px] text-slate-500">
                Adjust speed automatically by temperature
              </div>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={fanAuto}
            onClick={onToggleFanAuto}
            className={`w-12 h-7 rounded-full p-1 transition-colors relative flex items-center ${
              fanAuto ? 'bg-brand-blue' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                fanAuto ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 mt-1 italic">
        Virtual simulation only: The microcontroller simulates fan speed in software. No physical fan is attached.
      </p>
    </div>
  );
}
