import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { LineChart as ChartIcon, AlertCircle, Clock } from 'lucide-react';

export default function SensorChart({ history = [] }) {
  const [activeChannel, setActiveChannel] = useState('temp_hum'); // 'temp_hum' | 'ldr'

  const hasData = history.length >= 2;

  return (
    <div className="glass-card rounded-2xl p-5 shadow-glass">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <ChartIcon className="w-4 h-4 text-studio-terracotta" />
            Live Session Telemetry Curves
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Real data points recorded sequentially during this browser session
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-stone-100 p-0.5 rounded-xl border border-stone-200/80 flex text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveChannel('temp_hum')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeChannel === 'temp_hum'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Temp & Humidity
            </button>
            <button
              type="button"
              onClick={() => setActiveChannel('ldr')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeChannel === 'ldr'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              LDR Ambient Light
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas or Honest Empty State */}
      {!hasData ? (
        <div className="h-64 rounded-xl border border-dashed border-stone-200/90 bg-stone-50/50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-stone-700">Awaiting Real Telemetry Samples</h4>
          <p className="text-[11px] text-stone-400 max-w-sm mt-1 leading-relaxed">
            Data integrity guarantee: Charts display only observations collected from your ESP32.
            At least 2 live polls are required before plotting curves (Current samples: {history.length}).
          </p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis
                dataKey="timeStr"
                stroke="#a8a29e"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#e7e5e4' }}
              />
              <YAxis
                stroke="#a8a29e"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#e7e5e4' }}
                domain={activeChannel === 'temp_hum' ? [15, 45] : [0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  border: '1px solid #e7e5e4',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                  fontSize: '11px',
                  color: '#1c1917',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconType="circle"
              />

              {activeChannel === 'temp_hum' ? (
                <>
                  <Line
                    type="monotone"
                    name="Temperature (°C)"
                    dataKey="temperature"
                    stroke="#ea580c"
                    strokeWidth={2.2}
                    dot={false}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    name="Relative Humidity (%)"
                    dataKey="humidity"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </>
              ) : (
                <Line
                  type="monotone"
                  name="Light Reading (ADC)"
                  dataKey="ldr"
                  stroke="#d97706"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex justify-between items-center text-[10px] text-stone-400 mt-3 pt-2.5 border-t border-stone-100">
        <span>Session sample count: {history.length}</span>
        <span>Local in-memory buffer (cleared upon page reload)</span>
      </div>
    </div>
  );
}
