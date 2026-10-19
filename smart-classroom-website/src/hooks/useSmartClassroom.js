import { useState, useEffect, useCallback, useRef } from 'react';
import espApi, { DEFAULT_BASE_URL } from '../services/esp8266Api';

export function useSmartClassroom(pollIntervalMs = 2000) {
  const [data, setData] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [baseUrl, setBaseUrlState] = useState(espApi.baseUrl);
  const [isMockMode, setIsMockModeState] = useState(espApi.isMockMode);
  
  const consecutiveErrorsRef = useRef(0);
  const isRequestInFlightRef = useRef(false);

  // Sync state if api service settings change
  useEffect(() => {
    return espApi.subscribe(({ baseUrl, isMockMode }) => {
      setBaseUrlState(baseUrl);
      setIsMockModeState(isMockMode);
    });
  }, []);

  const fetchLatest = useCallback(async () => {
    if (isRequestInFlightRef.current) return;
    isRequestInFlightRef.current = true;

    try {
      const result = await espApi.fetchTelemetry();
      setData(result.data);
      setIsOnline(true);
      setIsConnecting(false);
      setLastUpdated(new Date());
      setLatencyMs(result.latencyMs);
      setErrorMessage(null);
      consecutiveErrorsRef.current = 0;
    } catch (err) {
      consecutiveErrorsRef.current += 1;
      // Mark offline if failed twice consecutively
      if (consecutiveErrorsRef.current >= 2) {
        setIsOnline(false);
        setIsConnecting(false);
        setErrorMessage(err.message || 'Connection lost');
      }
    } finally {
      isRequestInFlightRef.current = false;
    }
  }, []);

  // Polling loop
  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchLatest, pollIntervalMs, baseUrl, isMockMode]);

  // Action wrappers with automatic refresh
  const changeLightMode = useCallback(async (mode) => {
    try {
      await espApi.setLightMode(mode);
      await fetchLatest();
      return true;
    } catch (err) {
      setErrorMessage(`Failed to change lighting mode: ${err.message}`);
      return false;
    }
  }, [fetchLatest]);

  const toggleLed = useCallback(async (turnOn) => {
    try {
      await espApi.setLedState(turnOn);
      await fetchLatest();
      return true;
    } catch (err) {
      setErrorMessage(`Failed to change LED state: ${err.message}`);
      return false;
    }
  }, [fetchLatest]);

  const changeFanMode = useCallback(async (mode) => {
    try {
      await espApi.setFanMode(mode);
      await fetchLatest();
      return true;
    } catch (err) {
      setErrorMessage(`Failed to set fan mode: ${err.message}`);
      return false;
    }
  }, [fetchLatest]);

  const updateSettings = useCallback(async (settings) => {
    try {
      const result = await espApi.saveSettings(settings);
      if (result.ok) {
        await fetchLatest();
        return { ok: true };
      }
      return { ok: false, message: 'Microcontroller rejected settings validation.' };
    } catch (err) {
      return { ok: false, message: err.message || 'Request failed' };
    }
  }, [fetchLatest]);

  const updateBaseUrl = useCallback((newUrl) => {
    const updated = espApi.setBaseUrl(newUrl);
    setBaseUrlState(updated);
    setIsConnecting(true);
    consecutiveErrorsRef.current = 0;
    fetchLatest();
  }, [fetchLatest]);

  const toggleMockMode = useCallback((enabled) => {
    espApi.setMockMode(enabled);
    setIsMockModeState(Boolean(enabled));
    setIsConnecting(true);
    consecutiveErrorsRef.current = 0;
    fetchLatest();
  }, [fetchLatest]);

  return {
    data,
    isOnline,
    isConnecting,
    lastUpdated,
    latencyMs,
    errorMessage,
    baseUrl,
    isMockMode,
    refreshNow: fetchLatest,
    changeLightMode,
    toggleLed,
    changeFanMode,
    updateSettings,
    updateBaseUrl,
    toggleMockMode,
  };
}

export default useSmartClassroom;
