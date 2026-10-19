import React, { useState } from 'react';
import { X, Wifi, Globe, Sparkles, Check, AlertTriangle, HelpCircle } from 'lucide-react';
import { DEFAULT_BASE_URL } from '../services/esp8266Api';

export default function ConnectionModal({
  isOpen,
  onClose,
  baseUrl,
  onUpdateBaseUrl,
  isMockMode,
  onToggleMock,
  isOnline,
  latencyMs,
}) {
  const [inputUrl, setInputUrl] = useState(baseUrl);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateBaseUrl(inputUrl);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleResetDefault = () => {
    setInputUrl(DEFAULT_BASE_URL);
    onUpdateBaseUrl(DEFAULT_BASE_URL);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-navy-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wifi className="w-5 h-5 text-brand-blue" />
            <h3 className="text-base font-bold">Network & Device Connection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Base URL Configuration */}
          <form onSubmit={handleSave} className="space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Microcontroller API Base URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="http://192.168.4.1"
                  className="w-full text-xs font-mono pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                {savedNotice ? <Check className="w-3.5 h-3.5" /> : null}
                {savedNotice ? 'Saved!' : 'Save URL'}
              </button>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>Default SoftAP IP is usually <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">http://192.168.4.1</code></span>
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-brand-blue hover:underline font-semibold"
              >
                Reset Default
              </button>
            </div>
          </form>

          {/* Demo Simulation Toggle */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-purple-950">
                  Demo Simulation Mode (Mock API)
                </div>
                <div className="text-[11px] text-purple-700">
                  Simulate live sensors, virtual fan, and lighting without hardware
                </div>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isMockMode}
              onClick={() => onToggleMock(!isMockMode)}
              className={`w-12 h-7 rounded-full p-1 transition-colors relative flex items-center ${
                isMockMode ? 'bg-purple-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  isMockMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Firmware Access Point Information */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-emerald-600" />
              Firmware Access Point Details
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">SSID</div>
                <div className="font-mono font-bold text-slate-900">smart</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Password</div>
                <div className="font-mono font-bold text-slate-900">12345678</div>
              </div>
            </div>
          </div>

          {/* Connection Procedure Guide */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-brand-blue" />
              Step-by-Step Connection Guide
            </div>
            <ol className="text-[11px] text-slate-600 space-y-1.5 list-decimal list-inside bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <li>Upload the firmware sketch (<code className="text-slate-800 font-mono">SmartClassroom_ESP8266.ino</code> or <code className="text-slate-800 font-mono">SmartClassroom_ESP32.ino</code>) to your board.</li>
              <li>Open your PC or phone's Wi-Fi settings and connect to network <strong className="text-slate-900">smart</strong> with password <strong className="text-slate-900">12345678</strong>.</li>
              <li>Read the IP address in Serial Monitor (default is <strong className="text-slate-900">192.168.4.1</strong>).</li>
              <li><span className="text-amber-700 font-semibold">Important note:</span> While connected directly to the ESP's Access Point, your computer will communicate through this local network without normal internet access.</li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
