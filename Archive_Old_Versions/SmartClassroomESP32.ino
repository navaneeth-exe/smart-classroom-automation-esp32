/*
 * ==============================================================================
 * Project: Smart Classroom Automation System Using ESP32 and Arduino IDE
 * Target Board: ESP32 Development Board (ESP-WROOM-32 / 30-pin or 38-pin DevKit)
 * Phase: Hardware & Firmware Integration (Sensors, LED, and Automation Logic)
 * 
 * Hardware Pin Mapping (Audit-Verified):
 * - LED (Classroom Lighting): GPIO 18 (Digital Output, 330-ohm resistor in series)
 * - PIR Motion Sensor:        GPIO 19 (Digital Input, 3.3V logic or inline 1k resistor)
 * - DHT22 Temp & Humidity:    GPIO 4  (Bidirectional Digital I/O, 3.3V rail)
 * - LDR Ambient Light Sensor: GPIO 34 (Analog Input, ADC1 - Safe with active Wi-Fi)
 * ==============================================================================
 */

#include <WiFi.h>
#include <DHT.h>

// ========================== PIN CONFIGURATION ==============================
#define LED_PIN       18   // Digital Output to LED (via 330 ohm resistor to Anode)
#define PIR_PIN       19   // Digital Input from PIR motion sensor (OUT)
#define DHT_PIN       4    // Bidirectional Digital I/O for DHT22 sensor (DATA)
#define LDR_PIN       34   // Analog Input for LDR (ADC1_CH6, Wi-Fi safe, 0-3.3V)

// ========================== SENSOR SETUP ===================================
#define DHTTYPE DHT22      // Sensor type: DHT22 (AM2302)
DHT dht(DHT_PIN, DHTTYPE);

// ========================== CONFIGURABLE PARAMETERS ========================
// Wi-Fi Credentials:
// Leave as "YOUR_WIFI_SSID" during initial breadboard testing to run in standalone mode.
// This prevents RF power spikes and brownout resets on USB ports.
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Automation Thresholds:
// ESP32 ADC has 12-bit resolution (0 - 4095).
// In a standard divider (LDR to 3.3V, 10k to GND):
//   - Bright room: 2500 - 4000
//   - Dark room:   200  - 1500
// Default dark threshold: ADC < 2000 considered dark.
const int   LDR_DARK_THRESHOLD   = 2000;   // Adjust during testing to match classroom lighting
const unsigned long OCCUPANCY_TIMEOUT_MS = 15000; // Time (ms) light stays ON after motion ceases (15s for lab test)

// ========================== SYSTEM STATE VARIABLES =========================
bool isMotionDetected   = false;
int  ambientLightLevel  = 0;
float temperatureC      = 0.0;
float humidityPct       = 0.0;
bool isLightOn          = false;
bool manualOverride     = false; // Set to true if overriding auto-control

unsigned long lastMotionTime      = 0;
unsigned long lastSensorReadTime  = 0;
unsigned long lastWifiCheckTime   = 0;
unsigned long lastTelemetryPrint  = 0;

const unsigned long SENSOR_INTERVAL_MS   = 2000;  // DHT22 requires at least 2s between reads
const unsigned long TELEMETRY_INTERVAL_MS = 1000; // Print system status to Serial every 1s
const unsigned long WIFI_CHECK_INTERVAL_MS = 10000;// Check Wi-Fi connection every 10s non-blocking

// ========================== FUNCTION PROTOTYPES ===========================
void initHardware();
void checkWiFiConnection();
void readSensors();
void evaluateAutomationLogic();
void setLightState(bool state);
void printTelemetry();

// ========================== ARDUINO SETUP ==================================
void setup() {
  // Initialize Serial Monitor at 115200 baud
  Serial.begin(115200);
  delay(1000); // Brief delay for hardware UART stabilization

  Serial.println();
  Serial.println(F("======================================================"));
  Serial.println(F(" Smart Classroom Automation System - ESP32 Firmware  "));
  Serial.println(F(" Audit Version: 1.1 (Verified Wiring & State Logic)   "));
  Serial.println(F("======================================================"));

  // Initialize hardware pins and sensors
  initHardware();

  // Check Wi-Fi configuration
  if (strcmp(WIFI_SSID, "YOUR_WIFI_SSID") == 0) {
    Serial.println(F("[WIFI] Default credentials detected."));
    Serial.println(F("[WIFI] Operating in standalone OFFLINE hardware test mode."));
    WiFi.mode(WIFI_OFF); // Power down Wi-Fi radio to save power and prevent USB brownouts
  } else {
    Serial.println(F("[WIFI] Initiating non-blocking background Wi-Fi connection..."));
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }
  
  Serial.println(F("[SYSTEM] Initialization complete. Entering main loop..."));
  Serial.println();
}

// ========================== ARDUINO MAIN LOOP ==============================
void loop() {
  unsigned long currentMillis = millis();

  // 1. Maintain Wi-Fi connection non-blocking (only if configured)
  if (currentMillis - lastWifiCheckTime >= WIFI_CHECK_INTERVAL_MS) {
    lastWifiCheckTime = currentMillis;
    checkWiFiConnection();
  }

  // 2. Read Sensors at safe non-blocking intervals (DHT22 minimum 2s cycle)
  if (currentMillis - lastSensorReadTime >= SENSOR_INTERVAL_MS) {
    lastSensorReadTime = currentMillis;
    readSensors();
  }

  // 3. PIR Polling: Instantaneous motion detection
  int pirState = digitalRead(PIR_PIN);
  if (pirState == HIGH) {
    isMotionDetected = true;
    lastMotionTime = currentMillis; // Reset occupancy timer on active motion
  } else {
    // If occupancy timeout has elapsed without fresh motion, clear occupancy
    if (currentMillis - lastMotionTime >= OCCUPANCY_TIMEOUT_MS) {
      isMotionDetected = false;
    }
  }

  // 4. Evaluate Classroom Automation Logic (with optical feedback hysteresis)
  evaluateAutomationLogic();

  // 5. Output Telemetry Data to Serial Monitor
  if (currentMillis - lastTelemetryPrint >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryPrint = currentMillis;
    printTelemetry();
  }
}

// ========================== HARDWARE INITIALIZATION ========================
void initHardware() {
  Serial.println(F("[INIT] Configuring GPIO pins..."));

  // LED Output
  pinMode(LED_PIN, OUTPUT);
  setLightState(false); // Ensure lights start in OFF state

  // PIR Motion Sensor Input
  pinMode(PIR_PIN, INPUT);

  // LDR Analog Input (GPIO 34 is strictly an input pin on ESP32 ADC1)
  pinMode(LDR_PIN, INPUT);

  // Initialize DHT22 Sensor
  Serial.println(F("[INIT] Starting DHT22 sensor..."));
  dht.begin();

  // Startup LED self-test flash: verify LED polarity and circuit integrity
  Serial.println(F("[INIT] Executing LED self-test flash..."));
  setLightState(true);
  delay(300);
  setLightState(false);
  delay(200);

  Serial.println(F("[INIT] All hardware pins successfully initialized."));
}

// ========================== SENSOR READING FUNCTION =======================
void readSensors() {
  // Read Temperature and Humidity from DHT22
  float temp = dht.readTemperature(); // Celsius
  float hum  = dht.readHumidity();    // Relative Humidity %

  // Check for read errors (disconnects, pull-up missing, timing violations)
  if (isnan(temp) || isnan(hum)) {
    Serial.println(F("[WARN] DHT22 read failure! Check 3.3V power, GND, and 10k pull-up."));
  } else {
    temperatureC = temp;
    humidityPct  = hum;
  }

  // Read Analog Brightness from LDR
  // ESP32 ADC1 has 12-bit resolution: 0 (0.0V) to 4095 (~3.3V)
  ambientLightLevel = analogRead(LDR_PIN);
}

// ========================== AUTOMATION LOGIC ===============================
void evaluateAutomationLogic() {
  if (manualOverride) {
    return; // Bypass automation if manual override is active
  }

  /*
   * AUDIT CORRECTION - OPTICAL FEEDBACK HYSTERESIS:
   * On a breadboard, the LED sits near the LDR. If the LED turns ON in a dark room,
   * its own emitted light hits the LDR and causes ambientLightLevel to rise!
   * If we naively turn the light OFF whenever ambientLightLevel > threshold, the LED
   * will oscillate/strobe continuously.
   *
   * PROPER INDUSTRIAL AUTOMATION RULE:
   * 1. Turn ON if: Room is currently OFF + Motion Detected + Room is Dark.
   * 2. Keep ON while: Motion continues to be detected (Room is occupied).
   * 3. Turn OFF when: Occupancy timeout has expired (Room is empty).
   */
  bool isDark = (ambientLightLevel < LDR_DARK_THRESHOLD);

  if (!isLightOn) {
    // Light is OFF: Check if occupied and dark
    if (isMotionDetected && isDark) {
      Serial.println(F("[AUTO] Trigger: Motion detected in dark room -> Switching Light ON"));
      setLightState(true);
    }
  } else {
    // Light is ON: Keep ON until room is vacant (occupancy timeout elapsed)
    if (!isMotionDetected) {
      Serial.println(F("[AUTO] Trigger: Occupancy timeout reached (Room empty) -> Switching Light OFF"));
      setLightState(false);
    }
  }
}

// ========================== ACTUATOR CONTROL ===============================
void setLightState(bool state) {
  isLightOn = state;
  digitalWrite(LED_PIN, state ? HIGH : LOW);
}

// ========================== TELEMETRY LOGGING ==============================
void printTelemetry() {
  Serial.print(F("[STATUS] Light: "));
  Serial.print(isLightOn ? F("ON ") : F("OFF"));
  Serial.print(F(" | Motion: "));
  Serial.print(isMotionDetected ? F("OCCUPIED  ") : F("VACANT    "));
  Serial.print(F(" | LDR ADC: "));
  Serial.print(ambientLightLevel);
  Serial.print(F(" | Temp: "));
  if (isnan(temperatureC)) {
    Serial.print(F("ERR"));
  } else {
    Serial.print(temperatureC, 1);
    Serial.print(F(" C"));
  }
  Serial.print(F(" | Humidity: "));
  if (isnan(humidityPct)) {
    Serial.print(F("ERR"));
  } else {
    Serial.print(humidityPct, 1);
    Serial.print(F(" %"));
  }
  Serial.print(F(" | Wi-Fi: "));
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(F("Connected (IP: "));
    Serial.print(WiFi.localIP());
    Serial.print(F(")"));
  } else if (strcmp(WIFI_SSID, "YOUR_WIFI_SSID") == 0) {
    Serial.print(F("Offline Test Mode"));
  } else {
    Serial.print(F("Connecting/Disconnected"));
  }
  Serial.println();
}

// ========================== NON-BLOCKING WI-FI =============================
void checkWiFiConnection() {
  // If credentials are placeholder, stay in offline mode
  if (strcmp(WIFI_SSID, "YOUR_WIFI_SSID") == 0) {
    return;
  }
  // If credentials are set and Wi-Fi dropped, reconnect non-blocking
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[WIFI] Reconnecting in background..."));
    WiFi.reconnect();
  }
}
