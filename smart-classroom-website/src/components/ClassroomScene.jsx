import React from 'react';
import { Fan, Sun, Thermometer, Droplets, Users, ShieldCheck, Lightbulb } from 'lucide-react';

/**
 * ==============================================================================
 * Smart Classroom Scene Visualizer
 * ==============================================================================
 * Visual Integration:
 * 1. Ceiling Lighting: Realistic ceiling pendant downlights aligned near the fan.
 * 2. Physical LED Hardware Integration: When confirmed ON (ESP32 GPIO 18),
 *    the ceiling lamps illuminate with a soft warm radiance and downward light spill.
 *    When OFF or disconnected, the fixtures remain unlit in natural daylight.
 * 3. Strict Separation of Concerns:
 *    - Physical LED (ESP32): Real hardware state reflected on ceiling fixture & pin.
 *    - Room Lighting (Simulation): Separate atmospheric time-of-day/mood filter.
 * 4. Priority Preserved: Virtual Ceiling Fan remains prominent.
 */

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

  // Physical LED state from real ESP32 telemetry (strictly verified)
  const isPhysicalLedOn = Boolean(isOnline && data?.led);
  const isPhysicalLedKnown = Boolean(isOnline && data && typeof data.led === 'boolean');

  // Compute simulated environmental lighting overlay tint (mood filter only)
  let lightingTint = 'rgba(0, 0, 0, 0)';
  if (virtualLighting?.colorTemp === 'warm') {
    lightingTint = `rgba(245, 158, 11, ${0.03 + (virtualLighting.brightness / 100) * 0.1})`;
  } else if (virtualLighting?.colorTemp === 'cool') {
    lightingTint = `rgba(59, 130, 246, ${0.03 + (virtualLighting.brightness / 100) * 0.08})`;
  } else if (virtualLighting?.colorTemp === 'neutral') {
    lightingTint = `rgba(255, 255, 255, ${(virtualLighting.brightness / 100) * 0.07})`;
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border border-stone-200/70 shadow-glass">
      <div className="relative aspect-[16/10] sm:aspect-[16/9.5] w-full overflow-hidden bg-stone-100">
        {/* Photorealistic Classroom Base Image */}
        <img
          src="/classroom.jpg"
          alt="Smart Classroom Visual Scene"
          className="w-full h-full object-cover"
        />

        {/* Ambient Room Lighting Simulation Tint (Frontend Mood Filter) */}
        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: lightingTint }}
        />

        {/* Subtle Ceiling Depth Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/35 via-transparent to-stone-900/10 pointer-events-none" />

        {/* =====================================================================
            CEILING LIGHTING FIXTURES (DRIVEN BY PHYSICAL LED GPIO 18)
            ===================================================================== */}

        {/* Primary Ceiling Lamp Downward Spill (Right near fan) */}
        <div
          className={`absolute top-[17%] left-[67%] w-24 h-48 pointer-events-none transition-opacity duration-700 ${
            isPhysicalLedOn ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.2) 32%, transparent 72%)',
            clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
          }}
        />
        {/* Primary Lamp Aperture Emission */}
        <div
          className={`absolute top-[16.5%] left-[71.5%] -translate-x-1/2 w-4 h-1.5 rounded-full transition-all duration-500 pointer-events-none ${
            isPhysicalLedOn
              ? 'bg-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.95)] opacity-100'
              : 'opacity-0'
          }`}
        />

        {/* Secondary Ceiling Lamp Downward Spill (Far right cluster) */}
        <div
          className={`absolute top-[16%] left-[74.5%] w-20 h-40 pointer-events-none transition-opacity duration-700 ${
            isPhysicalLedOn ? 'opacity-90' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(254, 240, 138, 0.38) 0%, rgba(251, 191, 36, 0.16) 32%, transparent 72%)',
            clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
          }}
        />
        {/* Secondary Lamp Aperture Emission */}
        <div
          className={`absolute top-[15.5%] left-[78.5%] -translate-x-1/2 w-3.5 h-1.2 rounded-full transition-all duration-500 pointer-events-none ${
            isPhysicalLedOn
              ? 'bg-amber-100 shadow-[0_0_14px_rgba(251,191,36,0.9)] opacity-100'
              : 'opacity-0'
          }`}
        />

        {/* Center Ceiling Lamp Downward Spill (Left of fan) */}
        <div
          className={`absolute top-[23%] left-[37.5%] w-18 h-36 pointer-events-none transition-opacity duration-700 ${
            isPhysicalLedOn ? 'opacity-80' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(254, 240, 138, 0.32) 0%, rgba(251, 191, 36, 0.12) 32%, transparent 72%)',
            clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
          }}
        />
        {/* Center Lamp Aperture Emission */}
        <div
          className={`absolute top-[22.5%] left-[41%] -translate-x-1/2 w-3 h-1.2 rounded-full transition-all duration-500 pointer-events-none ${
            isPhysicalLedOn
              ? 'bg-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.85)] opacity-100'
              : 'opacity-0'
          }`}
        />

        {/* =========================================================================
            FLOATING CALLOUT PINS
            ========================================================================= */}

        {/* 1. Ceiling Fan (Top Center near ceiling) */}
        <div className="absolute top-[8%] left-[48%] -translate-x-1/2 z-10">
          <button
            type="button"
            onClick={() => onSelectOverlay?.('fan')}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-md hover:bg-white transition-all text-left"
          >
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
            <div>
              <div className="text-[10px] text-stone-400 font-semibold leading-tight">Ceiling Fan</div>
              <div className="text-xs font-bold text-stone-800 leading-tight">
                {virtualFanMode} {data?.fanAuto ? '(Auto)' : '(Manual)'}
              </div>
            </div>
          </button>
        </div>

        {/* 2. Physical LED (ESP32 GPIO 18) Callout Pin pointing to ceiling fixture */}
        <div className="absolute top-[5%] right-[10%] z-10 flex flex-col items-center">
          <button
            type="button"
            onClick={() => onSelectOverlay?.('led')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-md hover:bg-white transition-all text-left"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isPhysicalLedOn
                  ? 'bg-amber-100 text-amber-600 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                  : 'bg-stone-100 text-stone-400'
              }`}
            >
              <Lightbulb className={`w-3.5 h-3.5 ${isPhysicalLedOn ? 'fill-amber-400 text-amber-500' : ''}`} />
            </div>
            <div>
              <div className="text-[10px] text-stone-400 font-semibold leading-tight">Physical LED (ESP32)</div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 leading-tight">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    !isOnline
                      ? 'bg-stone-300'
                      : isPhysicalLedOn
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-stone-300'
                  }`}
                />
                <span>
                  {!isOnline
                    ? 'Offline'
                    : isPhysicalLedOn
                    ? 'Confirmed ON'
                    : 'Confirmed OFF'}
                </span>
              </div>
            </div>
          </button>
          {/* Vertical pointer line pointing down to primary ceiling pendant lamp */}
          <div className="w-0.5 h-11 bg-gradient-to-b from-amber-400/80 to-amber-300/40 relative">
            <span
              className={`w-2 h-2 rounded-full absolute -bottom-1 -left-[3px] ring-2 ring-white transition-colors ${
                isPhysicalLedOn ? 'bg-amber-400' : 'bg-stone-300'
              }`}
            />
          </div>
        </div>

        {/* 3. Light Level (Window Ambient Light Sensor with vertical pointer line) */}
        <div className="absolute top-[16%] left-[22%] -translate-x-1/2 z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-md">
            <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <Sun className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-stone-400 font-semibold leading-tight">Ambient Light</div>
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

        {/* 4. Temperature (Mid Left with vertical pointer line) */}
        <div className="absolute top-[42%] left-[26%] -translate-x-1/2 z-10 flex flex-col items-center">
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

        {/* 5. Motion (Mid Right with vertical pointer line) */}
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

        {/* 6. Humidity (Lower Right) */}
        <div className="absolute bottom-[22%] right-[24%] z-10">
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

        {/* =========================================================================
            TRANSPARENT SEPARATION BADGE: HARDWARE VS SIMULATION
            ========================================================================= */}
        <div className="absolute bottom-2.5 left-3 z-10 flex items-center gap-2 px-2.5 py-1 rounded-xl bg-stone-900/60 backdrop-blur-md text-[10px] text-white/90 font-medium border border-white/10 pointer-events-none">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                !isOnline
                  ? 'bg-stone-400'
                  : isPhysicalLedOn
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-stone-400'
              }`}
            />
            <span>
              Ceiling Lamp: {!isOnline ? 'Offline' : isPhysicalLedOn ? 'Illuminated (LED ON)' : 'Dormant (LED OFF)'}
            </span>
          </span>
          <span className="text-white/30">|</span>
          <span className="text-white/80">
            Mood Filter: {virtualLighting?.colorTemp} ({virtualLighting?.brightness}%)
          </span>
        </div>
      </div>
    </div>
  );
}
