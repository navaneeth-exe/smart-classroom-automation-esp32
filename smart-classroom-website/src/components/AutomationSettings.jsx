import React, { useState, useEffect } from 'react';
import { Sliders, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function AutomationSettings({ data, onSaveSettings }) {
  const [slow, setSlow] = useState(25);
  const [medium, setMedium] = useState(30);
  const [high, setHigh] = useState(35);
  const [lightThreshold, setLightThreshold] = useState(900);
  const [timeout, setTimeoutSec] = useState(300);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with fetched data only when user is not actively editing
  useEffect(() => {
    if (data) {
      if (data.slowThreshold !== undefined) setSlow(data.slowThreshold);
      if (data.mediumThreshold !== undefined) setMedium(data.mediumThreshold);
      if (data.highThreshold !== undefined) setHigh(data.highThreshold);
      if (data.lightThreshold !== undefined) setLightThreshold(data.lightThreshold);
      if (data.timeoutSeconds !== undefined) setTimeoutSec(data.timeoutSeconds);
    }
  }, [data?.slowThreshold, data?.mediumThreshold, data?.highThreshold, data?.lightThreshold, data?.timeoutSeconds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    // Frontend validation matching firmware rules
    const s = parseFloat(slow);
    const m = parseFloat(medium);
    const h = parseFloat(high);
    const l = parseInt(lightThreshold, 10);
    const t = parseInt(timeout, 10);

    if (isNaN(s) || isNaN(m) || isNaN(h) || isNaN(l) || isNaN(t)) {
      setFeedback({ ok: false, message: 'Please enter valid numbers for all fields.' });
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

    const result = await onSaveSettings({
      slow: s,
      medium: m,
      high: h,
      lightThreshold: l,
      timeout: t,
    });

    if (result.ok) {
      setFeedback({ ok: true, message: 'Settings successfully applied to firmware.' });
    } else {
      setFeedback({ ok: false, message: result.message || 'Microcontroller rejected settings.' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-surface border border-slate-200/80 rounded-2xl p-5 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-blue" />
              Automation Thresholds
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live configuration parameters stored in firmware
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md border bg-slate-50 text-slate-700 border-slate-200">
            CONFIG
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* SLOW fan threshold */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                SLOW Fan starts (°C)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="60"
                value={slow}
                onChange={(e) => setSlow(e.target.value)}
                required
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
              />
            </div>

            {/* MEDIUM fan threshold */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                MEDIUM Fan starts (°C)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="60"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                required
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
              />
            </div>

            {/* HIGH fan threshold */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                HIGH Fan starts (°C)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="60"
                value={high}
                onChange={(e) => setHigh(e.target.value)}
                required
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
              />
            </div>

            {/* Darkness threshold */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Darkness Threshold (ADC)
              </label>
              <input
                type="number"
                min="0"
                max="4095"
                value={lightThreshold}
                onChange={(e) => setLightThreshold(e.target.value)}
                required
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
              />
            </div>

            {/* Occupancy timeout */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                No-Motion Timeout (Seconds)
              </label>
              <input
                type="number"
                min="5"
                max="3600"
                value={timeout}
                onChange={(e) => setTimeoutSec(e.target.value)}
                required
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              {isSubmitting ? 'Applying...' : 'Apply Settings'}
            </button>
          </div>
        </form>
      </div>

      <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 mt-3 italic">
        Settings are held in RAM and automatically reset to defaults after a microcontroller restart.
      </p>
    </div>
  );
}
