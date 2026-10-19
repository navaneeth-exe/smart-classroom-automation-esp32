/**
 * ==============================================================================
 * Centralized API Service for ESP8266 / ESP32 Smart Classroom Automation
 * ==============================================================================
 * Communicates with the microcontroller firmware using the verified API contract:
 * - GET /api          : Fetches live sensor data, runtime state, and thresholds
 * - GET /lightmode    : ?value=auto|manual
 * - GET /led          : ?value=on|off
 * - GET /fan          : ?value=auto|OFF|SLOW|MEDIUM|HIGH (virtual fan simulation)
 * - GET /settings     : ?slow=..&medium=..&high=..&lightThreshold=..&timeout=..
 * 
 * Supports dynamic IP configuration, request timeouts, connection tracking,
 * and optional Mock / Demo simulation mode when hardware is not connected.
 */

const STORAGE_KEY_BASE_URL = 'smart_classroom_esp_base_url';
const STORAGE_KEY_MOCK_MODE = 'smart_classroom_mock_mode';

export const DEFAULT_BASE_URL = 'http://192.168.4.1';
const REQUEST_TIMEOUT_MS = 2500;

// Internal state for demo simulation when physical ESP is offline
let mockState = {
  temperature: 28.4,
  humidity: 62.0,
  ldr: 420,
  rawMotion: true,
  occupied: true,
  dark: false,
  led: false,
  autoLight: true,
  fanMode: "SLOW",
  fanAuto: true,
  fanPercent: 33,
  slowThreshold: 25.0,
  mediumThreshold: 30.0,
  highThreshold: 35.0,
  lightThreshold: 900,
  timeoutSeconds: 300,
};

class EspApiService {
  constructor() {
    this.baseUrl = this.getStoredBaseUrl();
    this.isMockMode = this.getStoredMockMode();
    this.listeners = new Set();
  }

  getStoredBaseUrl() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BASE_URL);
      if (stored && stored.trim().length > 0) {
        return stored.trim().replace(/\/+$/, '');
      }
    } catch {
      // Ignore localStorage errors (e.g., in incognito or restricted mode)
    }
    return DEFAULT_BASE_URL;
  }

  setBaseUrl(newUrl) {
    let clean = (newUrl || '').trim().replace(/\/+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'http://' + clean;
    }
    this.baseUrl = clean;
    try {
      localStorage.setItem(STORAGE_KEY_BASE_URL, clean);
    } catch {
      // Ignore
    }
    this.notifyChange();
    return this.baseUrl;
  }

  getStoredMockMode() {
    try {
      return localStorage.getItem(STORAGE_KEY_MOCK_MODE) === 'true';
    } catch {
      return false;
    }
  }

  setMockMode(enabled) {
    this.isMockMode = Boolean(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_MOCK_MODE, String(this.isMockMode));
    } catch {
      // Ignore
    }
    this.notifyChange();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyChange() {
    this.listeners.forEach((fn) => fn({ baseUrl: this.baseUrl, isMockMode: this.isMockMode }));
  }

  /**
   * Safe fetch with AbortController timeout
   */
  async fetchWithTimeout(endpointPath, options = {}) {
    const url = `${this.baseUrl}${endpointPath}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        cache: 'no-store',
        mode: 'cors',
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /**
   * Fetches latest telemetry from /api
   */
  async fetchTelemetry() {
    if (this.isMockMode) {
      // Simulate minor sensor variations for realistic demo
      mockState = {
        ...mockState,
        temperature: +(mockState.temperature + (Math.random() * 0.2 - 0.1)).toFixed(1),
        humidity: Math.round(mockState.humidity + (Math.random() * 0.4 - 0.2)),
        ldr: Math.max(50, Math.min(1023, mockState.ldr + Math.floor(Math.random() * 10 - 5))),
      };
      return { data: { ...mockState }, isMock: true, latencyMs: 12 };
    }

    const startTime = performance.now();
    const response = await this.fetchWithTimeout('/api');
    const data = await response.json();
    const latencyMs = Math.round(performance.now() - startTime);

    return { data, isMock: false, latencyMs };
  }

  /**
   * Sets lighting mode: 'auto' or 'manual'
   */
  async setLightMode(mode) {
    const validMode = mode === 'manual' ? 'manual' : 'auto';
    if (this.isMockMode) {
      mockState.autoLight = validMode === 'auto';
      return { ok: true, isMock: true };
    }
    const response = await this.fetchWithTimeout(`/lightmode?value=${validMode}`);
    const text = await response.text();
    return { ok: text.includes('OK') };
  }

  /**
   * Sets manual LED state: 'on' or 'off'
   */
  async setLedState(turnOn) {
    const value = turnOn ? 'on' : 'off';
    if (this.isMockMode) {
      mockState.autoLight = false;
      mockState.led = Boolean(turnOn);
      return { ok: true, isMock: true };
    }
    const response = await this.fetchWithTimeout(`/led?value=${value}`);
    const text = await response.text();
    return { ok: text.includes('OK') };
  }

  /**
   * Sets virtual fan speed or auto mode
   * Allowed values: 'auto', 'OFF', 'SLOW', 'MEDIUM', 'HIGH'
   */
  async setFanMode(mode) {
    if (this.isMockMode) {
      if (mode === 'auto') {
        mockState.fanAuto = true;
      } else {
        mockState.fanAuto = false;
        mockState.fanMode = mode;
        mockState.fanPercent = mode === 'SLOW' ? 33 : mode === 'MEDIUM' ? 66 : mode === 'HIGH' ? 100 : 0;
      }
      return { ok: true, isMock: true };
    }
    const response = await this.fetchWithTimeout(`/fan?value=${encodeURIComponent(mode)}`);
    const text = await response.text();
    return { ok: text.includes('OK') };
  }

  /**
   * Applies automation settings
   * Expected: { slow, medium, high, lightThreshold, timeout }
   */
  async saveSettings(settings) {
    const params = new URLSearchParams({
      slow: String(settings.slow),
      medium: String(settings.medium),
      high: String(settings.high),
      lightThreshold: String(settings.lightThreshold),
      timeout: String(settings.timeout),
    });

    if (this.isMockMode) {
      mockState.slowThreshold = Number(settings.slow);
      mockState.mediumThreshold = Number(settings.medium);
      mockState.highThreshold = Number(settings.high);
      mockState.lightThreshold = Number(settings.lightThreshold);
      mockState.timeoutSeconds = Number(settings.timeout);
      return { ok: true, isMock: true };
    }

    const response = await this.fetchWithTimeout(`/settings?${params.toString()}`);
    const data = await response.json();
    return { ok: Boolean(data.ok) };
  }
}

export const espApi = new EspApiService();
export default espApi;
