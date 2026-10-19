import React from 'react';
import { Fan, Power, Wind, Gauge } from 'lucide-react';
import CeilingFan3D from './CeilingFan3D';

/**
 * ==============================================================================
 * Compact Virtual Ceiling Fan Card
 * ==============================================================================
 * Uses genuine WebGL 3D CeilingFan3D component with independent rotor rotation.
 * Never rotates flat images.
 */

export default function VirtualFan({
  temperature,
  virtualFanMode,
  virtualFanAuto,
  fanThresholds,
  onSetManualSpeed,
  onReturnToAuto,
}) {
  // Bar count (0 to 4 bars filled)
  let activeBars = 0;
  if (virtualFanMode === 'LOW') activeBars = 1;
  else if (virtualFanMode === 'MEDIUM') activeBars = 3;
  else if (virtualFanMode === 'HIGH') activeBars = 4;

  const buttons = [
    { id: 'OFF', label: 'Off', icon: Power },
    { id: 'LOW', label: 'Low', icon: Wind },
    { id: 'MEDIUM', label: 'Medium', icon: Fan },
    { id: 'HIGH', label: 'High', icon: Gauge },
  ];

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-stone-200/70 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header matching reference */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Fan className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">
              Ceiling Fan (Virtual 3D)
            </h3>
          </div>

          <button
            type="button"
            onClick={() => (virtualFanAuto ? onSetManualSpeed('OFF') : onReturnToAuto())}
            className={`px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border transition-all ${
              virtualFanAuto
                ? 'bg-[#ede9fe] text-[#4338ca] border-[#c7d2fe]'
                : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}
          >
            {virtualFanAuto ? 'AUTO' : 'MANUAL'}
          </button>
        </div>

        {/* Center Section: True 3D WebGL Fan + Speed info */}
        <div className="grid grid-cols-2 items-center gap-2 my-2">
          {/* 3D WebGL Fan Canvas (No flat image rotation!) */}
          <div className="relative aspect-square max-h-36 flex items-center justify-center overflow-hidden">
            <CeilingFan3D
              mode={virtualFanMode}
              isAuto={virtualFanAuto}
              height={140}
              className="w-full h-full"
            />
          </div>

          {/* Speed Info matching reference */}
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-stone-400">Current Speed</div>
            <div className="text-2xl font-black text-stone-900 tracking-tight">
              {virtualFanMode}
            </div>

            {/* 4 horizontal bars matching reference */}
            <div className="flex items-center gap-1 py-1">
              {[1, 2, 3, 4].map((barIndex) => (
                <div
                  key={barIndex}
                  className={`h-2.5 w-4 rounded-full transition-all ${
                    barIndex <= activeBars ? 'bg-amber-400' : 'bg-stone-200/80'
                  }`}
                />
              ))}
            </div>

            <div className="text-[10px] text-stone-400">
              {virtualFanAuto
                ? `Based on ${
                    temperature !== null && temperature !== undefined && !isNaN(temperature)
                      ? `${Number(temperature).toFixed(1)} °C`
                      : 'N/A'
                  }`
                : 'Manual override active'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 4 Buttons matching reference */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-100">
        {buttons.map((b) => {
          const isSelected = virtualFanMode === b.id;
          const Icon = b.icon;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSetManualSpeed(b.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-[#e0e7ff] text-[#3730a3] border-[#c7d2fe] font-bold shadow-sm'
                  : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5 mb-1" />
              <span>{b.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
