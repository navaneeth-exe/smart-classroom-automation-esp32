import { calculateVirtualFanMode } from './src/utils/fanAutomation.js';

const testCases = [
  [20.0, 'OFF', true],
  [24.9, 'OFF', true],
  [25.0, 'LOW', true],
  [27.9, 'LOW', true],
  [28.0, 'MEDIUM', true],
  [30.9, 'MEDIUM', true],
  [31.0, 'HIGH', true],
  [35.0, 'HIGH', true],
  [null, 'OFF', false],
  [NaN, 'OFF', false],
  [undefined, 'OFF', false],
];

console.log('Running Virtual Fan Threshold Validation Tests...');
let passed = 0;
for (const [temp, expectedMode, expectedValid] of testCases) {
  const result = calculateVirtualFanMode(temp);
  const modeMatch = result.mode === expectedMode;
  const validMatch = result.isValid === expectedValid;
  if (modeMatch && validMatch) {
    console.log(`  ✓ temp=${temp}°C -> mode=${result.mode} (valid=${result.isValid})`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: temp=${temp}°C -> expected mode=${expectedMode}, got=${result.mode}`);
  }
}

if (passed === testCases.length) {
  console.log(`ALL ${passed}/${testCases.length} FAN THRESHOLD TESTS PASSED!`);
} else {
  process.exit(1);
}
