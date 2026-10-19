import React from 'react';
import VirtualFanHero from '../components/VirtualFanHero';
import LiveSensorData from '../components/LiveSensorData';
import ClassroomScene from '../components/ClassroomScene';
import RoomLightingSimulation from '../components/RoomLightingSimulation';
import PhysicalLedControl from '../components/PhysicalLedControl';
import RecentActivity from '../components/RecentActivity';

/**
 * ==============================================================================
 * Smart Classroom Studio — Overview Page
 * ==============================================================================
 * Primary Hero Hierarchy:
 * 1. Primary: Virtual Fan Studio (Dominant WebGL 3D ceiling fan, ESP32 temperature
 *    coupling, automatic airflow velocity reaction, prominent speed/mode controls).
 * 2. Secondary: Live Sensor Telemetry (4-column real sensor reading cards with sparklines).
 * 3. Tertiary: Classroom Scene Visualizer, Physical LED Hardware Control,
 *    Room Lighting Simulation, and Recent Activity Event Log.
 */

export default function Overview({
  data,
  isOnline,
  isConnecting,
  isTestMode,
  isStale,
  lastUpdated,
  virtualFanMode,
  virtualFanAuto,
  fanThresholds,
  virtualLighting,
  onChangeVirtualLighting,
  onSetManualFanSpeed,
  onReturnFanToAuto,
  onSetPhysicalLed,
  onSetPhysicalLightMode,
  activityLog,
  onNavigate,
}) {
  return (
    <div className="space-y-6">
      {/* =======================================================================
          1. PRIMARY HERO SECTION: 3D VIRTUAL FAN STUDIO
          ======================================================================= */}
      <VirtualFanHero
        temperature={data?.temperature}
        virtualFanMode={virtualFanMode}
        virtualFanAuto={virtualFanAuto}
        fanThresholds={fanThresholds}
        isOnline={isOnline}
        isStale={isStale}
        isConnecting={isConnecting}
        isTestMode={isTestMode}
        lastUpdated={lastUpdated}
        onSetManualSpeed={onSetManualFanSpeed}
        onReturnToAuto={onReturnFanToAuto}
      />

      {/* =======================================================================
          2. SECONDARY SECTION: LIVE SENSOR TELEMETRY ROW (4 Columns)
          ======================================================================= */}
      <LiveSensorData
        data={data}
        isOnline={isOnline}
        isConnecting={isConnecting}
        isTestMode={isTestMode}
        layout="row"
      />

      {/* =======================================================================
          3. TERTIARY SECTION: CLASSROOM SCENE, PHYSICAL LED, LIGHTING & AUDIT LOG
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Supporting Classroom Visualizer (lg:col-span-6 xl:col-span-5) */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-stone-700">Classroom Environment Preview</span>
            <span className="text-[10px] text-stone-400 font-medium">Real-Time Sensor Pins</span>
          </div>
          <ClassroomScene
            data={data}
            isOnline={isOnline}
            virtualFanMode={virtualFanMode}
            virtualLighting={virtualLighting}
            onSelectOverlay={(overlayId) => {
              if (overlayId === 'fan' || overlayId === 'led') onNavigate('devices');
            }}
          />
        </div>

        {/* Physical LED & Simulated Room Mood Lighting (lg:col-span-6 xl:col-span-4) */}
        <div className="lg:col-span-6 xl:col-span-4 space-y-4">
          <PhysicalLedControl
            data={data}
            isOnline={isOnline}
            onSetLed={onSetPhysicalLed}
            onSetLightMode={onSetPhysicalLightMode}
          />

          <RoomLightingSimulation
            virtualLighting={virtualLighting}
            onChangeVirtualLighting={onChangeVirtualLighting}
          />
        </div>

        {/* Recent Activity Audit Log (lg:col-span-12 xl:col-span-3) */}
        <div className="lg:col-span-12 xl:col-span-3">
          <RecentActivity
            activityLog={activityLog}
            onViewAll={() => onNavigate('insights')}
          />
        </div>
      </div>
    </div>
  );
}
