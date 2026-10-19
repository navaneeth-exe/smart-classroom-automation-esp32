import { useState, useEffect, useCallback, useRef } from 'react';
import deviceApi, { DEFAULT_POLL_INTERVAL_MS } from '../services/deviceApi';
import { calculateVirtualFanMode, DEFAULT_FAN_THRESHOLDS } from '../utils/fanAutomation';

const MAX_HISTORY_SAMPLES = 60;
const STALE_DATA_THRESHOLD_MS = 8000;

export function useDeviceData(pollIntervalMs = DEFAULT_POLL_INTERVAL_MS) {
  const [data, setData] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isTestMode, setIsTestModeState] = useState(deviceApi.isTestMode);
  const [baseUrl, setBaseUrlState] = useState(deviceApi.baseUrl);

  // Real collected observation history (No fabricated data)
  const [sensorHistory, setSensorHistory] = useState([]);
  // Recent observed events
  const [activityLog, setActivityLog] = useState([]);

  // Virtual Fan State (Frontend Controlled Simulation)
  const [virtualFanMode, setVirtualFanMode] = useState('OFF');
  const [virtualFanAuto, setVirtualFanAuto] = useState(true);
  const [fanThresholds, setFanThresholds] = useState(DEFAULT_FAN_THRESHOLDS);

  const prevDataRef = useRef(null);
  const isRequestInFlightRef = useRef(false);
  const consecutiveFailuresRef = useRef(0);

  // Sync when API settings change (e.g. Test Mode or Base URL updated)
  useEffect(() => {
    return deviceApi.subscribe(({ baseUrl: newUrl, isTestMode: newMode }) => {
      setBaseUrlState(newUrl);
      setIsTestModeState(newMode);
    });
  }, []);

  // Event logger helper
  const addActivityEvent = useCallback((type, message, category = 'system') => {
    const newEvent = {
      id: Date.now() + Math.random().toString(36).substr(2, 4),
      time: new Date(),
      type,
      message,
      category, // 'hardware' | 'virtual' | 'connection' | 'policy'
    };
    setActivityLog((prev) => [newEvent, ...prev].slice(0, 40));
  }, []);

  // Update virtual fan mode when temperature changes
  useEffect(() => {
    if (virtualFanAuto) {
      const calc = calculateVirtualFanMode(data?.temperature, fanThresholds);
      setVirtualFanMode(calc.mode);

      // Log virtual fan transition if mode changed
      if (prevDataRef.current && prevDataRef.current.fanMode !== calc.mode) {
        addActivityEvent(
          'FAN_SPEED',
          `Virtual ceiling fan adjusted to ${calc.mode} (${calc.reason})`,
          'virtual'
        );
      }
    }
  }, [data?.temperature, virtualFanAuto, fanThresholds, addActivityEvent]);

  // Main polling routine
  const pollDevice = useCallback(async () => {
    if (isRequestInFlightRef.current) return;
    isRequestInFlightRef.current = true;

    try {
      const result = await deviceApi.fetchLiveTelemetry();
      const currentData = result.data;
      const now = result.timestamp;

      // Detect hardware events compared to previous poll
      if (prevDataRef.current) {
        const prev = prevDataRef.current;
        if (!prev.rawMotion && currentData.rawMotion) {
          addActivityEvent('MOTION_DETECTED', 'PIR Motion Sensor: Classroom presence active', 'hardware');
        } else if (prev.rawMotion && !currentData.rawMotion) {
          addActivityEvent('MOTION_CLEARED', 'PIR Motion Sensor: Motion cleared', 'hardware');
        }

        if (prev.led !== currentData.led) {
          addActivityEvent(
            'LED_STATE',
            `Physical LED on ${currentData.led ? 'turned ON' : 'turned OFF'}`,
            'hardware'
          );
        }

        if (prev.dark !== currentData.dark) {
          addActivityEvent(
            'LIGHT_LEVEL',
            `Ambient light changed: Room is now ${currentData.dark ? 'DARK' : 'BRIGHT'} (LDR: ${currentData.ldr})`,
            'hardware'
          );
        }
      } else {
        // First connection established
        addActivityEvent(
          'CONNECT',
          `Connected to Smart Classroom firmware (${result.isTestFixture ? 'Test Fixture' : 'Live Hardware'})`,
          'connection'
        );
      }

      // Record valid sample into real history
      if (currentData.temperature !== null || currentData.humidity !== null || currentData.ldr !== null) {
        setSensorHistory((prev) => [
          ...prev,
          {
            timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            timestamp: now.getTime(),
            temperature: currentData.temperature,
            humidity: currentData.humidity,
            ldr: currentData.ldr,
            motion: currentData.rawMotion ? 1 : 0,
          },
        ].slice(-MAX_HISTORY_SAMPLES));
      }

      prevDataRef.current = currentData;
      setData(currentData);
      setIsOnline(true);
      setIsConnecting(false);
      setIsStale(false);
      setLastUpdated(now);
      setLatencyMs(result.latencyMs);
      setErrorMessage(null);
      consecutiveFailuresRef.current = 0;
    } catch (err) {
      consecutiveFailuresRef.current += 1;
      if (consecutiveFailuresRef.current >= 2) {
        if (isOnline) {
          addActivityEvent('DISCONNECT', `Connection lost: ${err.message}`, 'connection');
        }
        setIsOnline(false);
        setIsConnecting(false);
        setErrorMessage(err.message || 'Device unreachable');
      }
    } finally {
      isRequestInFlightRef.current = false;
    }
  }, [isOnline, addActivityEvent]);

  // Polling timer
  useEffect(() => {
    pollDevice();
    const interval = setInterval(pollDevice, pollIntervalMs);
    return () => clearInterval(interval);
  }, [pollDevice, pollIntervalMs, baseUrl, isTestMode]);

  // Stale data watchdog timer
  useEffect(() => {
    const watchdog = setInterval(() => {
      if (lastUpdated && Date.now() - lastUpdated.getTime() > STALE_DATA_THRESHOLD_MS) {
        setIsStale(true);
      }
    }, 2000);
    return () => clearInterval(watchdog);
  }, [lastUpdated]);

  // Control actions
  const setPhysicalLed = useCallback(async (turnOn) => {
    try {
      addActivityEvent('CMD_LED', `Sending command: Physical LED -> ${turnOn ? 'ON' : 'OFF'}`, 'hardware');
      const result = await deviceApi.setPhysicalLed(turnOn);
      if (result.ok) {
        await pollDevice();
        return { ok: true };
      }
      return { ok: false, message: 'Device failed to acknowledge LED command.' };
    } catch (err) {
      setErrorMessage(`LED command failed: ${err.message}`);
      return { ok: false, message: err.message };
    }
  }, [pollDevice, addActivityEvent]);

  const setPhysicalLightMode = useCallback(async (mode) => {
    try {
      addActivityEvent('CMD_POLICY', `Setting lighting policy to ${mode.toUpperCase()}`, 'policy');
      const result = await deviceApi.setLightMode(mode);
      if (result.ok) {
        await pollDevice();
        return { ok: true };
      }
      return { ok: false, message: 'Device failed to acknowledge lighting policy.' };
    } catch (err) {
      setErrorMessage(`Lighting mode update failed: ${err.message}`);
      return { ok: false, message: err.message };
    }
  }, [pollDevice, addActivityEvent]);

  const setVirtualFanManual = useCallback((mode) => {
    // Controls frontend visual simulation only
    setVirtualFanAuto(false);
    setVirtualFanMode(mode);
    addActivityEvent('FAN_MANUAL', `Virtual fan switched to MANUAL mode: ${mode}`, 'virtual');
    // Also notify firmware's virtual state representation
    deviceApi.setVirtualFanState(mode).catch(() => {});
  }, [addActivityEvent]);

  const setVirtualFanAutoMode = useCallback(() => {
    setVirtualFanAuto(true);
    addActivityEvent('FAN_AUTO', 'Virtual fan returned to AUTO temperature-responsive mode', 'virtual');
    deviceApi.setVirtualFanState('auto').catch(() => {});
  }, [addActivityEvent]);

  const updateFanThresholds = useCallback((newThresholds) => {
    setFanThresholds(newThresholds);
    addActivityEvent('CONFIG_FAN', 'Updated virtual fan temperature thresholds', 'virtual');
  }, [addActivityEvent]);

  const updateDeviceSettings = useCallback(async (settings) => {
    try {
      addActivityEvent('CONFIG_FIRMWARE', 'Applying updated threshold parameters to firmware RAM', 'policy');
      const result = await deviceApi.saveSettings(settings);
      if (result.ok) {
        await pollDevice();
        return { ok: true };
      }
      return { ok: false, message: 'Firmware validation rejected the parameters.' };
    } catch (err) {
      return { ok: false, message: err.message || 'Failed to apply settings' };
    }
  }, [pollDevice, addActivityEvent]);

  const setBaseUrl = useCallback((newUrl) => {
    const updated = deviceApi.setBaseUrl(newUrl);
    setBaseUrlState(updated);
    setIsConnecting(true);
    consecutiveFailuresRef.current = 0;
    pollDevice();
  }, [pollDevice]);

  const setTestMode = useCallback((enabled) => {
    deviceApi.setTestMode(enabled);
    setIsTestModeState(Boolean(enabled));
    setIsConnecting(true);
    consecutiveFailuresRef.current = 0;
    pollDevice();
  }, [pollDevice]);

  return {
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
    refreshNow: pollDevice,
    setPhysicalLed,
    setPhysicalLightMode,
    setVirtualFanManual,
    setVirtualFanAutoMode,
    updateFanThresholds,
    updateDeviceSettings,
    setBaseUrl,
    setTestMode,
  };
}

export default useDeviceData;
