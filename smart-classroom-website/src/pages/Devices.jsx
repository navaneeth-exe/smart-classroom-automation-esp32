import React from 'react';
import { Cpu, Lightbulb, Fan, Thermometer, Sun, Users, Wifi, ShieldCheck, Zap } from 'lucide-react';

export default function Devices({
  data,
  isOnline,
  virtualFanMode,
  virtualFanAuto,
  onSetPhysicalLed,
  onSetPhysicalLightMode,
  onSetManualFanSpeed,
  onReturnFanToAuto,
}) {
  const temp = data?.temperature;
  const hum = data?.humidity;
  const ldr = data?.ldr;
  const occupied = Boolean(data?.occupied);
  const rawMotion = Boolean(data?.rawMotion);
  const isLightOn = Boolean(data?.led);
  const autoLight = Boolean(data?.autoLight);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <Cpu className="w-5 h-5 text-stone-700" />
          Hardware & Virtual Peripherals Directory
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Detailed diagnostic overview of physical sensors, actuators, and simulated modules
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Physical LED */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-500">
                <Lightbulb className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Physical Hardware
              </span>
            </div>

            <h3 className="font-bold text-stone-900 text-sm">Classroom LED Actuator</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Pin: ESP32 GPIO 18 (NodeMCU D6) via 330Ω resistor
            </p>

            <div className="my-4 p-3 rounded-2xl bg-white/90 border border-stone-200/70 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Confirmed State:</span>
                <span className="font-bold text-stone-800">{isLightOn ? 'ON' : 'OFF'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Control Mode:</span>
                <span className="font-bold text-stone-800">{autoLight ? 'Automatic' : 'Manual'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              disabled={!isOnline}
              onClick={() => onSetPhysicalLed(true)}
              className="py-2 px-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all disabled:opacity-40"
            >
              Turn ON
            </button>
            <button
              type="button"
              disabled={!isOnline}
              onClick={() => onSetPhysicalLed(false)}
              className="py-2 px-2 bg-white border border-stone-200 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-50 transition-all disabled:opacity-40"
            >
              Turn OFF
            </button>
          </div>
        </div>

        {/* 2. Virtual Ceiling Fan */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
                <Fan className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                Virtual Simulation
              </span>
            </div>

            <h3 className="font-bold text-stone-900 text-sm">Ceiling Fan Simulator</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Pure software animation driven by DHT22 temperature
            </p>

            <div className="my-4 p-3 rounded-2xl bg-white/90 border border-stone-200/70 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Virtual Speed:</span>
                <span className="font-bold text-stone-800">{virtualFanMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Thermal Driver:</span>
                <span className="font-bold text-stone-800">
                  {temp !== null && temp !== undefined ? `${temp}°C` : 'Awaiting sensor'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-1.5 pt-2 border-t border-stone-100">
            {['OFF', 'LOW', 'MEDIUM', 'HIGH'].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => onSetManualFanSpeed(spd)}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                  virtualFanMode === spd && !virtualFanAuto
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                {spd}
              </button>
            ))}
          </div>
        </div>

        {/* 3. DHT22 Climate Sensor */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-orange-500">
                <Thermometer className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Digital Sensor
              </span>
            </div>

            <h3 className="font-bold text-stone-900 text-sm">DHT22 (AM2302) Module</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Pin: ESP32 GPIO 4 (NodeMCU D2) · Single-bus data line
            </p>

            <div className="my-4 p-3 rounded-2xl bg-white/90 border border-stone-200/70 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Temperature:</span>
                <span className="font-bold text-stone-800">
                  {temp !== null && temp !== undefined ? `${Number(temp).toFixed(1)} °C` : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Humidity:</span>
                <span className="font-bold text-stone-800">
                  {hum !== null && hum !== undefined ? `${Math.round(hum)} %` : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Sample Frequency:</span>
                <span className="font-mono text-stone-600">2000 ms</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 pt-2 border-t border-stone-100 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>3.3V power rail · 10k pull-up resistor</span>
          </div>
        </div>

        {/* 4. LDR Light Sensor */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-500">
                <Sun className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Analog Sensor
              </span>
            </div>

            <h3 className="font-bold text-stone-900 text-sm">LDR Light Sensor Module</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Pin: ESP32 GPIO 34 (ADC1_CH6) / NodeMCU A0
            </p>

            <div className="my-4 p-3 rounded-2xl bg-white/90 border border-stone-200/70 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Raw ADC Value:</span>
                <span className="font-bold text-stone-800 font-mono">{ldr ?? '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Threshold:</span>
                <span className="font-mono text-stone-600">{data?.lightThreshold ?? 900}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Interpretation:</span>
                <span className="font-bold text-stone-800">
                  {ldr !== null && ldr !== undefined ? (data?.dark ? 'Dark Room' : 'Bright Room') : '--'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 pt-2 border-t border-stone-100 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>ADC1 input safe with active Wi-Fi radio</span>
          </div>
        </div>

        {/* 5. PIR Motion Sensor */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Digital Sensor
              </span>
            </div>

            <h3 className="font-bold text-stone-900 text-sm">PIR Motion Detector</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Pin: ESP32 GPIO 19 (NodeMCU D5) · Digital Input
            </p>

            <div className="my-4 p-3 rounded-2xl bg-white/90 border border-stone-200/70 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Real-time Motion:</span>
                <span className="font-bold text-stone-800">{rawMotion ? 'Active' : 'Clear'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Classroom Occupancy:</span>
                <span className="font-bold text-stone-800">{occupied ? 'Occupied' : 'Vacant'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Vacancy Timeout:</span>
                <span className="font-mono text-stone-600">{data?.timeoutSeconds ?? 300}s</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 pt-2 border-t border-stone-100 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fast hardware polling for zero motion lag</span>
          </div>
        </div>

        {/* 6. Wi-Fi Access Point */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-600">
                <Wifi className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                Network Radio
              </span>
            </div>

            <h3 className="font-bold text-stone-900 text-sm">Access Point & REST Server</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              SSID: <strong>smart</strong> · Port 80 HTTP Server
            </p>

            <div className="my-4 p-3 rounded-2xl bg-white/90 border border-stone-200/70 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Network Name:</span>
                <span className="font-mono font-bold text-stone-800">smart</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">WPA2 Password:</span>
                <span className="font-mono text-stone-600">12345678</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Default IP:</span>
                <span className="font-mono text-stone-800">192.168.4.1</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 pt-2 border-t border-stone-100 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>CORS preflight & GET handlers active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
