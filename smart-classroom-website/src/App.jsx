import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import Devices from './pages/Devices';
import Automation from './pages/Automation';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import useDeviceData from './hooks/useDeviceData';
import { AlertCircle, Sparkles, WifiOff } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [roomName, setRoomName] = useState('Classroom 1');

  // Virtual classroom lighting mood state (software filter)
  const [virtualLighting, setVirtualLighting] = useState({
    colorTemp: 'warm', // 'warm' | 'neutral' | 'cool'
    brightness: 70,
    autoSyncWithLdr: false,
  });

  const {
    data,
    isOnline,
    isConnecting,
    isStale,
    lastUpdated,
    latencyMs,
    errorMessage,
    baseUrl,
    isTestMode,
    sensorHistory,
    activityLog,
    virtualFanMode,
    virtualFanAuto,
    fanThresholds,
    refreshNow,
    setPhysicalLed,
    setPhysicalLightMode,
    setVirtualFanManual,
    setVirtualFanAutoMode,
    updateFanThresholds,
    updateDeviceSettings,
    setBaseUrl,
    setTestMode,
  } = useDeviceData(2500);

  return (
    <div className="min-h-screen bg-[#faf9f5] text-stone-900 flex p-3 sm:p-5 gap-4 font-sans selection:bg-[#4338ca] selection:text-white relative overflow-x-hidden">
      {/* Background Soft Pastel Ambient Atmosphere matching reference */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 right-1/4 w-[520px] h-[520px] bg-amber-200/20 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 -left-32 w-[460px] h-[460px] bg-purple-200/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 right-10 w-[520px] h-[520px] bg-sky-200/15 rounded-full blur-[140px]" />
      </div>

      {/* 1. Left Slim Navigation Rail matching reference */}
      <Sidebar
        activePage={activePage}
        onNavigate={(pageId) => setActivePage(pageId)}
        isOnline={isOnline}
        isTestMode={isTestMode}
        baseUrl={baseUrl}
        lastUpdated={lastUpdated}
      />

      {/* 2. Main Studio Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-[1600px] mx-auto relative z-10">
        {/* Top Header */}
        <Header
          roomName={roomName}
          data={data}
          isOnline={isOnline}
          isTestMode={isTestMode}
          onRefresh={refreshNow}
          isRefreshing={isConnecting}
        />

        {/* Isolated Test Mode Banner (Only visible when explicitly enabled) */}
        {isTestMode && (
          <div className="mb-4 p-3 rounded-2xl bg-purple-50/80 border border-purple-200 text-purple-900 text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 animate-pulse" />
              <span>
                <strong>Isolated Development Test Mode Active:</strong> Displaying simulated fixtures for design preview. Real hardware polling is paused.
              </span>
            </div>
            <button
              onClick={() => setTestMode(false)}
              className="text-[11px] font-bold text-purple-700 hover:underline px-2 py-1 bg-white/70 rounded-lg border border-purple-200"
            >
              Disable Test Mode
            </button>
          </div>
        )}

        {/* Device Offline Notice (When not in test mode) */}
        {!isOnline && !isTestMode && !isConnecting && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>ESP32 Hardware Offline ({baseUrl}):</strong> Connect your workstation to Wi-Fi access point <code className="font-bold bg-white/60 px-1 py-0.5 rounded">smart</code> (password: <code className="font-bold bg-white/60 px-1 py-0.5 rounded">12345678</code>) or enable Test Mode to preview interface.
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
              <button
                onClick={() => setTestMode(true)}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-[11px] transition-all shadow-sm"
              >
                Enable Test Mode
              </button>
              <button
                onClick={() => setActivePage('settings')}
                className="px-3 py-1 bg-white hover:bg-amber-100/50 border border-amber-300 text-amber-900 font-semibold rounded-xl text-[11px] transition-all"
              >
                Configure IP
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Page Router */}
        <main className="flex-1 pb-6">
          {activePage === 'overview' && (
            <Overview
              data={data}
              isOnline={isOnline}
              isConnecting={isConnecting}
              isTestMode={isTestMode}
              isStale={isStale}
              lastUpdated={lastUpdated}
              virtualFanMode={virtualFanMode}
              virtualFanAuto={virtualFanAuto}
              fanThresholds={fanThresholds}
              virtualLighting={virtualLighting}
              onChangeVirtualLighting={setVirtualLighting}
              onSetManualFanSpeed={setVirtualFanManual}
              onReturnFanToAuto={setVirtualFanAutoMode}
              onSetPhysicalLed={setPhysicalLed}
              onSetPhysicalLightMode={setPhysicalLightMode}
              activityLog={activityLog}
              onNavigate={(pageId) => setActivePage(pageId)}
            />
          )}

          {activePage === 'devices' && (
            <Devices
              data={data}
              isOnline={isOnline}
              virtualFanMode={virtualFanMode}
              virtualFanAuto={virtualFanAuto}
              onSetPhysicalLed={setPhysicalLed}
              onSetPhysicalLightMode={setPhysicalLightMode}
              onSetManualFanSpeed={setVirtualFanManual}
              onReturnFanToAuto={setVirtualFanAutoMode}
            />
          )}

          {activePage === 'automation' && (
            <Automation
              data={data}
              isOnline={isOnline}
              fanThresholds={fanThresholds}
              onUpdateFanThresholds={updateFanThresholds}
              onSaveFirmwareSettings={updateDeviceSettings}
            />
          )}

          {activePage === 'insights' && (
            <Insights
              sensorHistory={sensorHistory}
              activityLog={activityLog}
            />
          )}

          {activePage === 'settings' && (
            <Settings
              baseUrl={baseUrl}
              onUpdateBaseUrl={setBaseUrl}
              isTestMode={isTestMode}
              onToggleTestMode={setTestMode}
              isOnline={isOnline}
              latencyMs={latencyMs}
              lastUpdated={lastUpdated}
              errorMessage={errorMessage}
            />
          )}
        </main>
      </div>
    </div>
  );
}
