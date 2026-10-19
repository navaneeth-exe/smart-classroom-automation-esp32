/**
 * ==============================================================================
 * Smart Classroom Studio - Centralized Device API Service
 * ==============================================================================
 * Production API client for ESP32 / ESP8266 Smart Classroom microcontrollers.
 * 
 * Strict Data Integrity Rules:
 * - Real ESP responses only in production.
 * - Test mode is strictly isolated, disabled by default, and unmistakably labeled.
 * - Never silently falls back to mock data on network errors.
 * - Null / missing sensor readings remain null and are never converted to 0.
 * - Actual 0 readings are preserved as valid measurements.
 */

const STORAGE_KEY_BASE_URL = 'smart_classroom_studio_base_url';
const STORAGE_KEY_TEST_MODE = 'smart_classroom_studio_test_mode';

export const DEFAULT_BASE_URL = 'http://192.168.4.1';
export const DEFAULT_POLL_INTERVAL_MS = 2500;
const REQUEST_TIMEOUT_MS = 3000;

// Controlled fixtures for explicitly enabled Test Mode ONLY
let testFixtureState = {
  temperature: 28.4,
  humidity: 62.0,
  ldr: 320,
  rawMotion: true,
  occupied: true,
  dark: true,
  led: true,
  autoLight: false,
  fanMode: "MEDIUM",
  fanAuto: true,
  fanPercent: 66,
  slowThreshold: 25.0,
  mediumThreshold: 28.0,
  highThreshold: 31.0,
  lightThreshold: 500,
  timeoutSeconds: 300,
};

class DeviceApiService {
  constructor() {
    this.baseUrl = this.getStoredBaseUrl();
    this.isTestMode = this.getStoredTestMode();
    this.subscribers = new Set();
  }

  getStoredBaseUrl() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BASE_URL);
      if (stored && stored.trim().length > 0) {
        return stored.trim().replace(/\/+$/, '');
      }
    } catch {
      // LocalStorage access may be restricted in some browser settings
    }
    return DEFAULT_BASE_URL;
  }

  setBaseUrl(url) {
    let clean = (url || '').trim().replace(/\/+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'http://' + clean;
    }
    this.baseUrl = clean;
    try {
      localStorage.setItem(STORAGE_KEY_BASE_URL, clean);
    } catch {
      // Ignore
    }
    this.notifySubscribers();
    return this.baseUrl;
  }

  getStoredTestMode() {
    try {
      return localStorage.getItem(STORAGE_KEY_TEST_MODE) === 'true';
    } catch {
      return false; // MUST be disabled by default
    }
  }

  setTestMode(enabled) {
    this.isTestMode = Boolean(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_TEST_MODE, String(this.isTestMode));
    } catch {
      // Ignore
    }
    this.notifySubscribers();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach((fn) => fn({
      baseUrl: this.baseUrl,
      isTestMode: this.isTestMode,
    }));
  }

  /**
   * Internal HTTP fetch with timeout and CORS configuration
   */
  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
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
        throw new Error(`Device responded with HTTP ${response.status} (${response.statusText})`);
      }
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Connection timed out after ${REQUEST_TIMEOUT_MS}ms. Device unreachable at ${this.baseUrl}`);
      }
      throw new Error(`Network failure: ${err.message || 'Failed to fetch'}`);
    }
  }

  /**
   * Fetches latest live sensor data & states from GET /api
   */
  async fetchLiveTelemetry() {
    // If user explicitly enabled Test Mode
    if (this.isTestMode) {
      testFixtureState = {
        ...testFixtureState,
        temperature: +(testFixtureState.temperature + (Math.random() * 0.2 - 0.1)).toFixed(1),
        humidity: Math.round(testFixtureState.humidity + (Math.random() * 0.4 - 0.2)),
        ldr: Math.max(50, Math.min(1023, testFixtureState.ldr + Math.floor(Math.random() * 8 - 4))),
      };
      return {
        data: { ...testFixtureState },
        isTestFixture: true,
        latencyMs: 14,
        timestamp: new Date(),
      };
    }

    // Production real fetch
    const startTime = performance.now();
    const response = await this.request('/api');
    const rawData = await response.json();
    const latencyMs = Math.round(performance.now() - startTime);

    // Validate sensor payload structure
    const validatedData = {
      temperature: rawData.temperature !== null && rawData.temperature !== undefined && !isNaN(rawData.temperature)
        ? Number(rawData.temperature)
        : null,
      humidity: rawData.humidity !== null && rawData.humidity !== undefined && !isNaN(rawData.humidity)
        ? Number(rawData.humidity)
        : null,
      ldr: typeof rawData.ldr === 'number' ? rawData.ldr : null,
      rawMotion: Boolean(rawData.rawMotion),
      occupied: Boolean(rawData.occupied),
      dark: Boolean(rawData.dark),
      led: Boolean(rawData.led),
      autoLight: Boolean(rawData.autoLight),
      fanMode: typeof rawData.fanMode === 'string' ? rawData.fanMode : 'OFF',
      fanAuto: Boolean(rawData.fanAuto),
      fanPercent: typeof rawData.fanPercent === 'number' ? rawData.fanPercent : 0,
      slowThreshold: typeof rawData.slowThreshold === 'number' ? rawData.slowThreshold : 25.0,
      mediumThreshold: typeof rawData.mediumThreshold === 'number' ? rawData.mediumThreshold : 28.0,
      highThreshold: typeof rawData.highThreshold === 'number' ? rawData.highThreshold : 31.0,
      lightThreshold: typeof rawData.lightThreshold === 'number' ? rawData.lightThreshold : 900,
      timeoutSeconds: typeof rawData.timeoutSeconds === 'number' ? rawData.timeoutSeconds : 300,
    };

    return {
      data: validatedData,
      isTestFixture: false,
      latencyMs,
      timestamp: new Date(),
    };
  }

  /**
   * Sets Physical LED state via GET /led?value=on|off
   */
  async setPhysicalLed(turnOn) {
    const value = turnOn ? 'on' : 'off';
    if (this.isTestMode) {
      testFixtureState.led = Boolean(turnOn);
      testFixtureState.autoLight = false;
      return { ok: true, isTestFixture: true };
    }

    const response = await this.request(`/led?value=${value}`);
    const text = await response.text();
    return { ok: text.includes('OK') };
  }

  /**
   * Sets lighting policy via GET /lightmode?value=auto|manual
   */
  async setLightMode(mode) {
    const validMode = mode === 'manual' ? 'manual' : 'auto';
    if (this.isTestMode) {
      testFixtureState.autoLight = validMode === 'auto';
      return { ok: true, isTestFixture: true };
    }

    const response = await this.request(`/lightmode?value=${validMode}`);
    const text = await response.text();
    return { ok: text.includes('OK') };
  }

  /**
   * Updates firmware virtual fan state via GET /fan?value=auto|OFF|SLOW|MEDIUM|HIGH
   * Note: The fan is simulated in software; no physical fan exists.
   */
  async setVirtualFanState(mode) {
    if (this.isTestMode) {
      if (mode === 'auto') {
        testFixtureState.fanAuto = true;
      } else {
        testFixtureState.fanAuto = false;
        testFixtureState.fanMode = mode;
        testFixtureState.fanPercent = mode === 'SLOW' || mode === 'LOW' ? 33 : mode === 'MEDIUM' ? 66 : mode === 'HIGH' ? 100 : 0;
      }
      return { ok: true, isTestFixture: true };
    }

    const response = await this.request(`/fan?value=${encodeURIComponent(mode)}`);
    const text = await response.text();
    return { ok: text.includes('OK') };
  }

  /**
   * Applies automation settings via GET /settings?...
   */
  async saveSettings(settings) {
    const params = new URLSearchParams({
      slow: String(settings.slow),
      medium: String(settings.medium),
      high: String(settings.high),
      lightThreshold: String(settings.lightThreshold),
      timeout: String(settings.timeout),
    });

    if (this.isTestMode) {
      testFixtureState.slowThreshold = Number(settings.slow);
      testFixtureState.mediumThreshold = Number(settings.medium);
      testFixtureState.highThreshold = Number(settings.high);
      testFixtureState.lightThreshold = Number(settings.lightThreshold);
      testFixtureState.timeoutSeconds = Number(settings.timeout);
      return { ok: true, isTestFixture: true };
    }

    const response = await this.request(`/settings?${params.toString()}`);
    const result = await response.json();
    return { ok: Boolean(result.ok) };
  }

  /**
   * Direct connection ping probe to test an arbitrary URL
   */
  async testConnection(testUrl) {
    const cleanUrl = (testUrl || this.baseUrl).trim().replace(/\/+$/, '');
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(`${cleanUrl}/api`, {
        signal: controller.signal,
        cache: 'no-store',
        mode: 'cors',
      });
      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: `Device replied with HTTP ${response.status}`,
          latencyMs,
        };
      }
      const data = await response.json();
      return {
        success: true,
        latencyMs,
        message: `Device responded successfully (${latencyMs}ms)`,
        data,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      return {
        success: false,
        latencyMs: null,
        message: err.name === 'AbortError'
          ? 'Probe timed out after 3500ms'
          : (err.message || 'Connection failed'),
      };
    }
  }
}

export const deviceApi = new DeviceApiService();
export default deviceApi;
