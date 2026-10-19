import React from 'react';
import { Wifi, Globe, ExternalLink, Info } from 'lucide-react';

export default function ConnectionCard({ baseUrl, isOnline, onOpenModal }) {
  return (
    <div className="bg-surface border border-slate-200/80 rounded-2xl p-5 shadow-card mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-600" />
            Connection Information
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Microcontroller network & hardware communications
          </p>
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {isOnline ? 'CONNECTED' : 'STANDALONE AP'}
        </span>
      </div>

      <div className="space-y-3">
        {/* Row 1: Wi-Fi network */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs text-slate-900 block">Wi-Fi Access Point</strong>
              <small className="text-[11px] text-slate-500 block">
                SSID: <strong>smart</strong> | Password: <strong>12345678</strong>
              </small>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
            smart
          </span>
        </div>

        {/* Row 2: Target address */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs text-slate-900 block">Configured API Base URL</strong>
              <small className="text-[11px] text-slate-500 block">
                Target microcontroller address polled by this dashboard
              </small>
            </div>
          </div>
          <button
            onClick={onOpenModal}
            className="flex items-center gap-1 font-mono text-xs font-bold text-brand-blue hover:underline bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200"
          >
            <span>{baseUrl}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 pt-3 mt-1 flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          This website runs independently on your computer. When connected to the ESP8266 / ESP32 access point, your computer communicates directly over the local network without internet requirements.
        </span>
      </p>
    </div>
  );
}
