/**
 * ==============================================================================
 * Smart Classroom Studio - Virtual Fan Automation Rules
 * ==============================================================================
 * Strictly pure, testable mapping function.
 * Note: The ceiling fan is purely a virtual software simulation responding
 * to real temperature readings. No physical fan is attached.
 */

export const DEFAULT_FAN_THRESHOLDS = {
  slow: 25.0,    // 25°C to < 28°C -> LOW
  medium: 28.0,  // 28°C to < 31°C -> MEDIUM
  high: 31.0,    // >= 31°C -> HIGH
};

/**
 * Calculates virtual fan speed mode from temperature.
 * 
 * Rules:
 * - temp < 25.0°C                  -> OFF
 * - 25.0°C <= temp < 28.0°C        -> LOW (33%)
 * - 28.0°C <= temp < 31.0°C        -> MEDIUM (66%)
 * - temp >= 31.0°C                 -> HIGH (100%)
 * 
 * @param {number|null|undefined} temperature
 * @param {typeof DEFAULT_FAN_THRESHOLDS} thresholds
 * @returns {{ mode: 'OFF'|'LOW'|'MEDIUM'|'HIGH', speedPercent: number, isValid: boolean, reason: string }}
 */
export function calculateVirtualFanMode(temperature, thresholds = DEFAULT_FAN_THRESHOLDS) {
  if (temperature === null || temperature === undefined || isNaN(temperature)) {
    return {
      mode: 'OFF',
      speedPercent: 0,
      isValid: false,
      reason: 'Temperature data unavailable or invalid.',
    };
  }

  const temp = Number(temperature);
  const slow = Number(thresholds.slow ?? DEFAULT_FAN_THRESHOLDS.slow);
  const medium = Number(thresholds.medium ?? DEFAULT_FAN_THRESHOLDS.medium);
  const high = Number(thresholds.high ?? DEFAULT_FAN_THRESHOLDS.high);

  if (temp < slow) {
    return {
      mode: 'OFF',
      speedPercent: 0,
      isValid: true,
      reason: `${temp.toFixed(1)}°C is below cooling threshold (${slow}°C).`,
    };
  }
  if (temp < medium) {
    return {
      mode: 'LOW',
      speedPercent: 33,
      isValid: true,
      reason: `${temp.toFixed(1)}°C requires gentle airflow.`,
    };
  }
  if (temp < high) {
    return {
      mode: 'MEDIUM',
      speedPercent: 66,
      isValid: true,
      reason: `${temp.toFixed(1)}°C requires moderate airflow.`,
    };
  }
  return {
    mode: 'HIGH',
    speedPercent: 100,
    isValid: true,
    reason: `${temp.toFixed(1)}°C exceeds high threshold (${high}°C). Full cooling airflow.`,
  };
}
