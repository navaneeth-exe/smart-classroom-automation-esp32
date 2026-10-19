import React from 'react';
import { Fan, Sun, Thermometer, Droplets, Users, ShieldCheck } from 'lucide-react';

export default function ClassroomScene({
  data,
  isOnline,
  virtualFanMode,
  virtualLighting,
  onSelectOverlay,
}) {
  const temp = data?.temperature;
  const hum = data?.humidity;
  const ldr = data?.ldr;
  const occupied = Boolean(data?.occupied);
  const rawMotion = Boolean(data?.rawMotion);

  // Compute simulated lighting overlay tint
  let lightingTint = 'rgba(0, 0, 0, 0)';
  if (virtualLighting?.colorTemp === 'warm') {
    lightingTint = `rgba(245, 158, 11, ${0.04 + (virtualLighting.brightness / 100) * 0.12})`;
  } else if (virtualLighting?.colorTemp === 'cool') {
    lightingTint = `rgba(59, 130, 246, ${0.04 + (virtualLighting.brightness / 100) * 0.1})`;
  } else if (virtualLighting?.colorTemp === 'neutral') {
    lightingTint = `rgba(255, 255, 255, ${(virtualLighting.brightness / 100) * 0.08})`;
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border border-stone-200/70 shadow-glass">
      <div className="relative aspect-[16/10] sm:aspect-[16/9.5] w-full overflow-hidden bg-stone-100">
        {/* Photorealistic Classroom Image */}
        <img
          src="/classroom.jpg"
          alt="Smart Classroom Visual Scene"
          className="w-full h-full object-cover"
        />

        {/* Ambient Room Lighting Simulation Tint */}
        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: lightingTint }}
        />

        {/* Subtle Depth Shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/35 via-transparent to-stone-900/10 pointer-events-none" />

        {/* =========================================================================
            EXACT FLOATING PINS MATCHING REFERENCE IMAGE
            ========================================================================= */}

        {/* 1. Ceiling Fan (Top Center near ceiling) */}
        <div className="absolute top-[8%] left-[48%] -translate-x-1/2 z-10">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-md">
            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-700">
              <Fan
                className={`w-3.5 h-3.5 ${
                  virtualFanMode === 'LOW'
                    ? 'fan-spin-slow text-sky-600'
                    : virtualFanMode === 'MEDIUM'
                    ? 'fan-spin-medium text-blue-600'
                    : virtualFanMode === 'HIGH'
                    ? 'fan-spin-high text-indigo-600'
                    : 'text-stone-400'
                }`}
              />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-stone-400 font-semibold leading-tight">Ceiling Fan</div>
              <div className="text-xs font-bold text-stone-800 leading-tight">
                {virtualFanMode} {data?.fanAuto ? '(Auto)' : '(Manual)'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Light Level (Top Left with vertical pointer line) */}
        <div className="absolute top-[16%] left-[24%] -translate-x-1/2 z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-md">
            <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <Sun className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-stone-400 font-semibold leading-tight">Light Level</div>
              <div className="text-xs font-bold text-stone-800 leading-tight">
                {ldr !== null && ldr !== undefined ? `${ldr} (${data?.dark ? 'Dim' : 'Bright'})` : '--'}
              </div>
            </div>
          </div>
          {/* Vertical pointer line matching reference */}
          <div className="w-0.5 h-16 bg-gradient-to-b from-amber-400 to-amber-300 relative">
            <span className="w-2 h-2 rounded-full bg-amber-400 absolute -bottom-1 -left-[3px] ring-2 ring-white" />
          </div>
        </div>

        {/* 3. Temperature (Mid Left with vertical pointer line) */}
        <div className="absolute top-[42%] left-[28%] -translate-x-1/2 z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-md">
            <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Thermometer className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-stone-400 font-semibold leading-tight">Temperature</div>
              <div className="text-xs font-bold text-stone-800 leading-tight">
                {temp !== null && temp !== undefined && !isNaN(temp)
                  ? `${Number(temp).toFixed(1)} °C`
                  : '--'}
              </div>
            </div>
          </div>
          {/* Vertical pointer line */}
          <div className="w-0.5 h-14 bg-gradient-to-b from-purple-400 to-purple-300 relative">
            <span className="w-2 h-2 rounded-full bg-purple-400 absolute -bottom-1 -left-[3px] ring-2 ring-white" />
          </div>
        </div>

        {/* 4. Motion (Mid Right with vertical pointer line) */}
        <div className="absolute top-[36%] right-[22%] z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-md">
            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-stone-400 font-semibold leading-tight">Motion</div>
              <div className="text-xs font-bold text-stone-800 leading-tight">
                {rawMotion ? 'Detected' : occupied ? 'Occupied' : 'Clear'}
              </div>
            </div>
          </div>
          {/* Vertical pointer line */}
          <div className="w-0.5 h-16 bg-gradient-to-b from-emerald-400 to-emerald-300 relative">
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-1 -left-[3px] ring-2 ring-white" />
          </div>
        </div>

        {/* 5. Humidity (Lower Right) */}
        <div className="absolute bottom-[24%] right-[24%] z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-md">
            <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-stone-400 font-semibold leading-tight">Humidity</div>
              <div className="text-xs font-bold text-stone-800 leading-tight">
                {hum !== null && hum !== undefined && !isNaN(hum) ? `${Math.round(hum)} %` : '--'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
