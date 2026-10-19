import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Wifi,
  Globe,
  RefreshCw,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Server,
} from 'lucide-react';
import deviceApi, { DEFAULT_BASE_URL } from '../services/deviceApi';

export default function Settings({
  baseUrl,
  onUpdateBaseUrl,
  isTestMode,
  onToggleTestMode,
  isOnline,
  latencyMs,
  lastUpdated,
  errorMessage,
}) {
  const [inputUrl, setInputUrl] = useState(baseUrl);
  const [probeResult, setProbeResult] = useState(null);
  const [isProbing, setIsProbing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveUrl = (e) => {
    e.preventDefault();
    onUpdateBaseUrl(inputUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestProbe = async () => {
    setIsProbing(true);
    setProbeResult(null);
    const res = await deviceApi.testConnection(inputUrl);
    setProbeResult(res);
    setIsProbing(false);
  };

  const handleResetDefaultUrl = () => {
    setInputUrl(DEFAULT_BASE_URL);
    onUpdateBaseUrl(DEFAULT_BASE_URL);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-stone-700" />
          System Settings & Device Configuration
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Configure microcontroller network target, connection probes, and diagnostic tools
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Connection Setup & Test Probe */}
        <div className="lg:col-span-2 space-y-5">
          {/* 1. Base URL & Live Connection Probe */}
          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-studio-ocean" />
              Microcontroller Endpoint Address
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Enter the IP address of your ESP32 or ESP8266 board (Default AP IP: 192.168.4.1)
            </p>

            <form onSubmit={handleSaveUrl} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Server className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="http://192.168.4.1"
                    required
                    className="w-full text-xs font-mono font-medium pl-9 pr-3 py-2.5 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    {savedSuccess ? 'Saved!' : 'Save URL'}
                  </button>

                  <button
                    type="button"
                    disabled={isProbing}
                    onClick={handleTestProbe}
                    className="px-4 py-2.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
                    <span>{isProbing ? 'Testing...' : 'Test Probe'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-stone-400">
                <span>Stored in browser local preferences for this workstation</span>
                <button
                  type="button"
                  onClick={handleResetDefaultUrl}
                  className="text-stone-700 hover:underline font-semibold"
                >
                  Reset Default (192.168.4.1)
                </button>
              </div>
            </form>

            {/* Live Probe Result Box */}
            {probeResult && (
              <div
                className={`mt-4 p-3.5 rounded-2xl text-xs flex items-center justify-between gap-3 border ${
                  probeResult.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {probeResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span className="font-semibold truncate">{probeResult.message}</span>
                </div>
                {probeResult.latencyMs && (
                  <span className="font-mono text-[11px] bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200 flex-shrink-0">
                    {probeResult.latencyMs} ms
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 2. Isolated Test Mode Simulation */}
          <div className="glass-card rounded-3xl p-6 shadow-sm border border-purple-200/80 bg-purple-50/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Isolated Test Mode (Development Fixtures)
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    Preview the entire dashboard, simulated fan animation, and virtual controls without connecting to physical microcontroller hardware.
                  </p>
                  <div className="text-[11px] text-purple-700 font-semibold mt-2">
                    ⚠️ Disabled by default in production. Never confuses simulated data with live readings.
                  </div>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isTestMode}
                onClick={() => onToggleTestMode(!isTestMode)}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors relative flex items-center flex-shrink-0 ${
                  isTestMode ? 'bg-purple-600' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                    isTestMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Connection Guide & Network Specs */}
        <div className="space-y-5">
          {/* Wi-Fi AP Guide */}
          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-600" />
              Wi-Fi Connection Steps
            </h3>
            <ol className="text-xs text-stone-600 space-y-2.5 list-decimal list-inside leading-relaxed">
              <li>
                Flash <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800 font-mono">SmartClassroom_ESP32.ino</code> (or <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800 font-mono">SmartClassroom_ESP8266.ino</code>) to your board.
              </li>
              <li>
                Connect your PC Wi-Fi to network <strong className="text-stone-900">smart</strong>.
              </li>
              <li>
                Enter password: <strong className="text-stone-900 font-mono">12345678</strong>.
              </li>
              <li>
                Ensure this website target is set to <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800 font-mono">http://192.168.4.1</code>.
              </li>
            </ol>

            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900 mt-4 leading-relaxed">
              <strong>Local Network Notice:</strong> While connected directly to the ESP Access Point, your computer communicates directly over the local radio network without external internet access.
            </div>
          </div>

          {/* Diagnostic status */}
          <div className="glass-card rounded-3xl p-5 text-xs space-y-2">
            <div className="font-bold text-stone-900 mb-2">Connection Diagnostics</div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-400">Live Status:</span>
              <span className="font-bold text-stone-800">
                {isTestMode ? 'Test Mode Active' : isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-400">Latency:</span>
              <span className="font-mono text-stone-800">{latencyMs ? `${latencyMs} ms` : '--'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-400">Last Telemetry Poll:</span>
              <span className="text-stone-800">{lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--'}</span>
            </div>
            {errorMessage && (
              <div className="text-[11px] text-rose-600 pt-1 font-medium">
                Last Error: {errorMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
