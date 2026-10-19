import React from 'react';
import { Activity, Thermometer, Droplets, Sun, Radio } from 'lucide-react';

export default function SensorReadings({ data }) {
  const temp = data?.temperature;
  const hum = data?.humidity;
  const ldr = data?.ldr ?? 0;
  const rawMotion = Boolean(data?.rawMotion);
  const occupied = Boolean(data?.occupied);

  // Safe percentage calculations
  const tempPct = temp !== null && temp !== undefined && !isNaN(temp)
    ? Math.max(0, Math.min(100, (temp / 50) * 100))
    : 0;

  const humPct = hum !== null && hum !== undefined && !isNaN(hum)
    ? Math.max(0, Math.min(100, hum))
    : 0;

  // LDR scale: assume max 1023 (ESP8266) or 4095 (ESP32)
  const ldrMax = ldr > 1023 ? 4095 : 1023;
  const ldrPct = Math.max(0, Math.min(100, (ldr / ldrMax) * 100));

  const pirPct = rawMotion ? 100 : occupied ? 60 : 15;

  return (
    <div className="bg-surface border border-slate-200/80 rounded-2xl p-5 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-blue" />
              Live Sensor Channels
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Raw telemetry from physical hardware
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md border bg-slate-50 text-slate-700 border-slate-200">
            REAL-TIME
          </span>
        </div>

        <div className="space-y-4 my-2">
          {/* Temperature channel */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Thermometer className="w-3.5 h-3.5 text-blue-500" />
                Temperature
              </span>
              <span className="text-slate-900 font-bold">
                {temp !== null && temp !== undefined && !isNaN(temp)
                  ? `${Number(temp).toFixed(1)} °C`
                  : 'Sensor error'}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${tempPct}%` }}
              />
            </div>
          </div>

          {/* Humidity channel */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Droplets className="w-3.5 h-3.5 text-emerald-500" />
                Humidity
              </span>
              <span className="text-slate-900 font-bold">
                {hum !== null && hum !== undefined && !isNaN(hum)
                  ? `${Math.round(hum)} %`
                  : 'Sensor error'}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${humPct}%` }}
              />
            </div>
          </div>

          {/* LDR Channel */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                LDR Brightness Reading
              </span>
              <span className="text-slate-900 font-bold">
                {ldr} / {ldrMax} ADC
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                style={{ width: `${ldrPct}%` }}
              />
            </div>
          </div>

          {/* PIR Channel */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Radio className="w-3.5 h-3.5 text-indigo-500" />
                PIR Motion Activity
              </span>
              <span className="text-slate-900 font-bold">
                {rawMotion ? 'Active (HIGH)' : occupied ? 'Recent' : 'Idle (LOW)'}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${pirPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 mt-3 italic">
        Readings update automatically every 2 seconds via <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">/api</code>.
      </p>
    </div>
  );
}
