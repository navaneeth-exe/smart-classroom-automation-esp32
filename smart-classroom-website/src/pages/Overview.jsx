import React from 'react';
import VirtualFanHero from '../components/VirtualFanHero';
import PhysicalLedControl from '../components/PhysicalLedControl';
import LiveSensorData from '../components/LiveSensorData';
import ClassroomScene from '../components/ClassroomScene';
import RoomLightingSimulation from '../components/RoomLightingSimulation';
import RecentActivity from '../components/RecentActivity';

/**
 * ==============================================================================
 * Smart Classroom Studio — Overview Page
 * ==============================================================================
 * Visual Hierarchy & Layout:
 * 1. Primary Hero Section: 3D Virtual Fan Studio (Hero) + Physical LED (ESP32) (Adjacent Card)
 *    - On desktop (xl:grid-cols-12): Fan Studio occupies 8 columns (dominant hero focus),
 *      Physical LED occupies 4 columns (compact companion device).
 *    - On mobile/tablet: stacks in logical sequence (Fan Studio -> Physical LED).
 * 2. Secondary Section: Live Sensor Data (4-column row with sparklines).
 * 3. Tertiary Section: Classroom Environment Preview (left 7 cols) +
 *    Room Lighting Simulation & Recent Activity Audit Log (right 5 cols).
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
          1 & 2. PRIMARY CONTROLLABLE DEVICES WORKSPACE:
          VIRTUAL FAN STUDIO (HERO) + PHYSICAL LED (ESP32) (ADJACENT CARD)
          ======================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* 1. Primary Feature: Virtual Fan Studio (xl:col-span-8 2xl:col-span-8) */}
        <div className="xl:col-span-8 2xl:col-span-8 flex">
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
            className="w-full h-full"
          />
        </div>

        {/* 2. Adjacent Device Card: Physical LED (ESP32) (xl:col-span-4 2xl:col-span-4) */}
        <div className="xl:col-span-4 2xl:col-span-4 flex">
          <PhysicalLedControl
            data={data}
            isOnline={isOnline}
            isStale={isStale}
            isConnecting={isConnecting}
            isTestMode={isTestMode}
            lastUpdated={lastUpdated}
            onSetLed={onSetPhysicalLed}
            onSetLightMode={onSetPhysicalLightMode}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* =======================================================================
          3. LIVE SENSOR DATA: 4-COLUMN METRICS ROW
          ======================================================================= */}
      <LiveSensorData
        data={data}
        isOnline={isOnline}
        isConnecting={isConnecting}
        isTestMode={isTestMode}
        layout="row"
      />

      {/* =======================================================================
          4, 5, 6. SECONDARY WORKSPACE: CLASSROOM ENVIRONMENT PREVIEW,
          ROOM LIGHTING (SIMULATION) & RECENT ACTIVITY
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* 4. Classroom Environment Preview (lg:col-span-7 xl:col-span-7) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-3">
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

        {/* 5 & 6. Room Lighting (Simulation) & Recent Activity Audit Log (lg:col-span-5 xl:col-span-5) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          {/* 5. Room Lighting (Simulation) - Clearly separate from physical LED */}
          <RoomLightingSimulation
            virtualLighting={virtualLighting}
            onChangeVirtualLighting={onChangeVirtualLighting}
          />

          {/* 6. Recent Activity & Sensor Event Log */}
          <RecentActivity
            activityLog={activityLog}
            onViewAll={() => onNavigate('insights')}
          />
        </div>
      </div>
    </div>
  );
}
