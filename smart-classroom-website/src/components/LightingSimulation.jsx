import React from 'react';
import { SunMedium, Sparkles, Sliders, Palette } from 'lucide-react';

export default function LightingSimulation({
  virtualLighting,
  onChangeVirtualLighting,
  ldrValue,
}) {
  const { colorTemp, brightness, autoSyncWithLdr } = virtualLighting;

  const presets = [
    { id: 'warm', label: 'Warm 2700K', bg: 'bg-amber-100/70 text-amber-900 border-amber-300' },
    { id: 'neutral', label: 'Neutral 4000K', bg: 'bg-stone-100 text-stone-900 border-stone-300' },
    { id: 'cool', label: 'Cool 6500K', bg: 'bg-sky-100/70 text-sky-900 border-sky-300' },
  ];

  const handlePreset = (presetId) => {
    onChangeVirtualLighting({
      ...virtualLighting,
      colorTemp: presetId,
    });
  };

  const handleBrightness = (val) => {
    onChangeVirtualLighting({
      ...virtualLighting,
      brightness: parseInt(val, 10),
    });
  };

  const handleToggleSync = () => {
    onChangeVirtualLighting({
      ...virtualLighting,
      autoSyncWithLdr: !autoSyncWithLdr,
    });
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <SunMedium className="w-4 h-4 text-studio-amber" />
                Room Lighting (Simulation)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                Visual Only
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Frontend visual lighting mood filter applied to the classroom visualization
            </p>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
            BROWSER MOOD
          </span>
        </div>

        {/* Color Presets */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-stone-700 mb-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-stone-400" />
            Ambient Color Preset
          </label>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => {
              const isSelected = colorTemp === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePreset(p.id)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                    isSelected
                      ? `${p.bg} shadow-sm font-bold scale-[1.02]`
                      : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Brightness Slider */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-stone-400" />
              Scene Illumination Intensity
            </span>
            <span className="font-mono text-stone-900">{brightness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => handleBrightness(e.target.value)}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
          />
          <div className="flex justify-between text-[10px] text-stone-400 mt-1">
            <span>Dim (0%)</span>
            <span>Balanced (50%)</span>
            <span>Vivid (100%)</span>
          </div>
        </div>

        {/* Sync with real LDR reading toggle */}
        <div className="flex items-center justify-between py-2.5 border-t border-stone-100">
          <div>
            <div className="text-xs font-bold text-stone-800">Adaptive Daylight Tint</div>
            <div className="text-[11px] text-stone-500">
              Subtly shift filter based on LDR reading ({ldrValue ?? '--'} ADC)
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={autoSyncWithLdr}
            onClick={handleToggleSync}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors relative flex items-center ${
              autoSyncWithLdr ? 'bg-stone-900' : 'bg-stone-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                autoSyncWithLdr ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <p className="text-[11px] text-stone-400 border-t border-stone-100 pt-2.5 mt-2 italic">
        Software preview filter only: does not physically dim hardware bulbs or invent analog dimmer commands.
      </p>
    </div>
  );
}
