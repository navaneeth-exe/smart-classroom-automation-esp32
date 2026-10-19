import React, { useState, useEffect } from 'react';
import { Zap, Sliders, CheckCircle2, AlertCircle, Save, RotateCcw, ShieldCheck } from 'lucide-react';
import { DEFAULT_FAN_THRESHOLDS } from '../utils/fanAutomation';

export default function Automation({
  data,
  isOnline,
  fanThresholds,
  onUpdateFanThresholds,
  onSaveFirmwareSettings,
}) {
  const [slow, setSlow] = useState(fanThresholds.slow);
  const [medium, setMedium] = useState(fanThresholds.medium);
  const [high, setHigh] = useState(fanThresholds.high);
  const [lightThreshold, setLightThreshold] = useState(900);
  const [timeoutSec, setTimeoutSec] = useState(300);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      if (data.slowThreshold !== undefined) setSlow(data.slowThreshold);
      if (data.mediumThreshold !== undefined) setMedium(data.mediumThreshold);
      if (data.highThreshold !== undefined) setHigh(data.highThreshold);
      if (data.lightThreshold !== undefined) setLightThreshold(data.lightThreshold);
      if (data.timeoutSeconds !== undefined) setTimeoutSec(data.timeoutSeconds);
    }
  }, [data]);

  const handleResetDefaults = () => {
    setSlow(DEFAULT_FAN_THRESHOLDS.slow);
    setMedium(DEFAULT_FAN_THRESHOLDS.medium);
    setHigh(DEFAULT_FAN_THRESHOLDS.high);
    setLightThreshold(900);
    setTimeoutSec(300);
    onUpdateFanThresholds(DEFAULT_FAN_THRESHOLDS);
    setFeedback({ ok: true, message: 'Reset to default automation parameters.' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const s = parseFloat(slow);
    const m = parseFloat(medium);
    const h = parseFloat(high);
    const l = parseInt(lightThreshold, 10);
    const t = parseInt(timeoutSec, 10);

    if (isNaN(s) || isNaN(m) || isNaN(h) || isNaN(l) || isNaN(t)) {
      setFeedback({ ok: false, message: 'Please enter valid numbers in all fields.' });
      setIsSubmitting(false);
      return;
    }

    if (s < 0 || m <= s || h <= m) {
      setFeedback({ ok: false, message: 'Fan thresholds must satisfy: 0 ≤ SLOW < MEDIUM < HIGH.' });
      setIsSubmitting(false);
      return;
    }

    if (t < 5 || t > 3600) {
      setFeedback({ ok: false, message: 'Timeout must be between 5 and 3600 seconds.' });
      setIsSubmitting(false);
      return;
    }

    // Update frontend fan thresholds
    onUpdateFanThresholds({ slow: s, medium: m, high: h });

    // Submit to firmware RAM
    const res = await onSaveFirmwareSettings({
      slow: s,
      medium: m,
      high: h,
      lightThreshold: l,
      timeout: t,
    });

    if (res.ok) {
      setFeedback({ ok: true, message: 'Settings successfully applied to microcontroller RAM.' });
    } else {
      setFeedback({ ok: false, message: res.message || 'Microcontroller rejected settings.' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <Zap className="w-5 h-5 text-studio-amber" />
          Classroom Automation Engine
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Configure temperature triggers, darkness setpoints, and occupancy timers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form settings */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-stone-900 mb-1">
                Virtual Ceiling Fan Temperature Triggers
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Airflow transitions respond automatically to DHT22 temperature
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-white/90 border border-stone-200/80">
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    LOW Speed (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="60"
                    value={slow}
                    onChange={(e) => setSlow(e.target.value)}
                    required
                    className="w-full text-xs font-bold px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">Default: 25.0°C</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/90 border border-stone-200/80">
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    MEDIUM Speed (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="60"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    required
                    className="w-full text-xs font-bold px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">Default: 28.0°C</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/90 border border-stone-200/80">
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    HIGH Speed (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="60"
                    value={high}
                    onChange={(e) => setHigh(e.target.value)}
                    required
                    className="w-full text-xs font-bold px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">Default: 31.0°C</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 mb-1">
                Occupancy & Optical Setpoints
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Controls physical LED automatic trigger logic and vacancy shutdown
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-white/90 border border-stone-200/80">
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Darkness Threshold (ADC Value)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="4095"
                    value={lightThreshold}
                    onChange={(e) => setLightThreshold(e.target.value)}
                    required
                    className="w-full text-xs font-bold px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Readings above setpoint considered dark
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/90 border border-stone-200/80">
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    No-Motion Timeout (Seconds)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="3600"
                    value={timeoutSec}
                    onChange={(e) => setTimeoutSec(e.target.value)}
                    required
                    className="w-full text-xs font-bold px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Room marked empty if no motion occurs
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div
                className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                  feedback.ok
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedback.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Applying...' : 'Apply Thresholds'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-2xl text-xs font-semibold transition-all shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </form>
        </div>

        {/* Informational Policy Summary */}
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-5">
            <h3 className="font-bold text-sm text-stone-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Automated Policy Rules
            </h3>
            <ul className="text-xs text-stone-600 space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong>Lighting Automation:</strong> Physical LED turns ON when presence is active AND room is dark.
              </li>
              <li>
                <strong>Optical Hysteresis:</strong> Prevents strobe cycles by verifying vacancy before turning lights OFF.
              </li>
              <li>
                <strong>Virtual Cooling:</strong> Dynamically switches virtual fan speed according to actual temperature.
              </li>
              <li>
                <strong>RAM Persistence:</strong> Settings are active immediately in RAM and restore to defaults on reboot.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
