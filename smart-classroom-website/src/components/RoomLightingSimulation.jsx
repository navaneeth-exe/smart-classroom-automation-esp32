import React from 'react';
import { Lightbulb, Sun, SunMedium, Snowflake } from 'lucide-react';

export default function RoomLightingSimulation({
  virtualLighting,
  onChangeVirtualLighting,
}) {
  const { colorTemp, brightness } = virtualLighting;

  const presets = [
    { id: 'warm', label: 'Warm', icon: Sun },
    { id: 'neutral', label: 'Neutral', icon: SunMedium },
    { id: 'cool', label: 'Cool', icon: Snowflake },
  ];

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
              Room Lighting (Simulation)
            </h3>
          </div>

          <span className="px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#ede9fe] text-[#4338ca] border border-[#c7d2fe]">
            AUTO
          </span>
        </div>

        {/* Classroom thumbnail preview */}
        <div className="relative h-20 w-full rounded-2xl overflow-hidden mb-3 border border-stone-200/80">
          <img
            src="/classroom.jpg"
            alt="Lighting preview"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 transition-colors duration-300"
            style={{
              backgroundColor:
                colorTemp === 'warm'
                  ? `rgba(245, 158, 11, ${0.05 + (brightness / 100) * 0.15})`
                  : colorTemp === 'cool'
                  ? `rgba(59, 130, 246, ${0.05 + (brightness / 100) * 0.12})`
                  : `rgba(255, 255, 255, ${(brightness / 100) * 0.1})`,
            }}
          />
        </div>

        {/* 3 Color Presets matching reference */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {presets.map((p) => {
            const isSelected = colorTemp === p.id;
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChangeVirtualLighting({ ...virtualLighting, colorTemp: p.id })}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-2xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-amber-100/80 text-amber-900 border-amber-300 shadow-sm font-bold'
                    : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Brightness Slider matching reference */}
        <div className="flex items-center gap-3 pt-1">
          <Sun className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) =>
                onChangeVirtualLighting({ ...virtualLighting, brightness: parseInt(e.target.value, 10) })
              }
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-amber-300 via-amber-400 to-amber-100 accent-stone-800"
            />
          </div>
          <span className="text-xs font-bold text-stone-700 w-9 text-right font-mono">
            {brightness}%
          </span>
        </div>
      </div>
    </div>
  );
}
