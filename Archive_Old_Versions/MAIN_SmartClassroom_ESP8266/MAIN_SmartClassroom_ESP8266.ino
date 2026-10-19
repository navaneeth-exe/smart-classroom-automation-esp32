/*
 * ==============================================================================
 * Project: Smart Classroom Automation System Using ESP8266 NodeMCU
 * Target Board: NodeMCU 1.0 (ESP-12E / ESP-12F Module)
 * Phase: Hardware & Firmware Integration (Sensors, Actuator, & Automation Logic)
 * 
 * Hardware Pin Mapping (Verified):
 * - DHT22 DATA:              NodeMCU D2 (GPIO 4)  - Bidirectional Digital I/O
 * - PIR OUT:                 NodeMCU D5 (GPIO 14) - Digital Input (3.3V logic)
 * - LED Control:             NodeMCU D6 (GPIO 12) - Digital Output (via 330 ohm resistor)
 * - LDR Analog Reading:      NodeMCU A0 (ADC0)    - Analog Input (0 - 1023, 0 - 3.3V max)
 * - Power Rails:             3V3 -> DHT22 & LDR; VIN/VU -> PIR VCC; GND -> Common GND
 * ==============================================================================
 */

#include <ESP8266WiFi.h>
#include <DHT.h>

// ========================== PIN CONFIGURATION ==============================
// Fallback guards ensure compilation succeeds regardless of board package variant
#ifndef D2
  #define D2 4   // NodeMCU D2 is ESP8266 GPIO 4
#endif
#ifndef D5
  #define D5 14  // NodeMCU D5 is ESP8266 GPIO 14
#endif
#ifndef D6
  #define D6 12  // NodeMCU D6 is ESP8266 GPIO 12
#endif

#define DHT_PIN       D2   // GPIO 4  - Bidirectional single-bus line for DHT22
#define PIR_PIN       D5   // GPIO 14 - Digital input from PIR motion sensor
#define LED_PIN       D6   // GPIO 12 - Digital output to 330-ohm resistor & LED
#define LDR_PIN       A0   // ADC0    - 10-bit analog input for ambient light

// ========================== SENSOR SETUP ===================================
#define DHTTYPE DHT22      // Sensor model: DHT22 (AM2302)
DHT dht(DHT_PIN, DHTTYPE);

// ========================== CONFIGURABLE PARAMETERS ========================
// Wi-Fi Credentials:
const char* WIFI_SSID     = "Internetanyahu";
const char* WIFI_PASSWORD = "00000000";

// Automation Thresholds:
// ESP8266 ADC has 10-bit resolution (values from 0 to 1023).
// Your LDR module (inverted - pulls signal LOW when bright):
//   - Flashlight / very bright  -> ADC approx. 100 - 450  (LOW  = Bright)
//   - Classroom lights ON       -> ADC approx. 650 - 950  (MID  = Lit)
//   - Lights OFF / pitch dark   -> ADC approx. 960 - 1023 (HIGH = Dark)
// Threshold set so only near-total-darkness triggers the LED.
const int   LDR_DARK_THRESHOLD   = 950;   

// Occupancy Timeout:
// Time (in milliseconds) the light stays ON after motion ceases (15 seconds for testing).
const unsigned long OCCUPANCY_TIMEOUT_MS = 15000;

// ========================== SYSTEM STATE VARIABLES =========================
bool isMotionDetected   = false;
int  ambientLightLevel  = 0;
bool isDark             = false;
float temperatureC      = NAN;
float humidityPct       = NAN;
bool isLightOn          = false;

// Lighting Control Mode:
// false = AUTOMATIC (PIR + LDR controls the LED)
// true  = MANUAL (Firmware overrides sensor automation via manualLedState)
bool manualMode         = false;
bool manualLedState     = false;

// Non-blocking Timing Variables (millis)
unsigned long lastMotionTime       = 0;
unsigned long lastSensorReadTime   = 0;
unsigned long lastWifiCheckTime    = 0;
unsigned long lastTelemetryPrint   = 0;

const unsigned long SENSOR_INTERVAL_MS    = 2000;  // DHT22 requires minimum 2000 ms between reads
const unsigned long TELEMETRY_INTERVAL_MS  = 1000;  // Print status to Serial Monitor every 1000 ms
const unsigned long WIFI_CHECK_INTERVAL_MS = 10000; // Verify Wi-Fi state every 10 seconds

// ========================== FUNCTION PROTOTYPES ===========================
void initHardware();
void checkWiFiConnection();
void readSensors();
void evaluateAutomationLogic();
void setLightState(bool state);
void printTelemetry();

// ========================== ARDUINO SETUP ==================================
void setup() {
  // Initialize Serial communication at 115200 baud
  Serial.begin(115200);
  delay(1000); // Allow hardware UART to stabilize

  Serial.println();
  Serial.println(F("======================================================"));
  Serial.println(F(" Smart Classroom Automation System - NodeMCU Firmware "));
  Serial.println(F(" Board: ESP8266 (ESP-12E/F) | Sensors: DHT22, PIR, LDR"));
  Serial.println(F("======================================================"));

  // Initialize hardware pins and sensors
  initHardware();

  // Configure Wi-Fi mode
  if (strcmp(WIFI_SSID, "YOUR_WIFI_SSID") == 0) {
    Serial.println(F("[WIFI] Default credentials detected."));
    Serial.println(F("[WIFI] Running in standalone OFFLINE hardware test mode."));
    WiFi.mode(WIFI_OFF); // Power down Wi-Fi modem to save power and eliminate RF noise
  } else {
    Serial.println(F("[WIFI] Configuring Station mode and connecting..."));
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }

  Serial.println(F("[SYSTEM] Initialization complete. Entering main control loop..."));
  Serial.println();
}

// ========================== ARDUINO MAIN LOOP ==============================
void loop() {
  unsigned long currentMillis = millis();

  // 1. Maintain Wi-Fi connection non-blocking (only if credentials are configured)
  if (currentMillis - lastWifiCheckTime >= WIFI_CHECK_INTERVAL_MS) {
    lastWifiCheckTime = currentMillis;
    checkWiFiConnection();
  }

  // 2. Read environmental sensors at safe intervals (DHT22: 2s cycle)
  if (currentMillis - lastSensorReadTime >= SENSOR_INTERVAL_MS) {
    lastSensorReadTime = currentMillis;
    readSensors();
  }

  // 3. Fast PIR polling for instantaneous motion response
  int pirState = digitalRead(PIR_PIN);
  if (pirState == HIGH) {
    isMotionDetected = true;
    lastMotionTime = currentMillis; // Reset occupancy countdown on active movement
  } else {
    // If occupancy timeout has elapsed without fresh motion, mark room as unoccupied
    if (currentMillis - lastMotionTime >= OCCUPANCY_TIMEOUT_MS) {
      isMotionDetected = false;
    }
  }

  // 4. Evaluate classroom lighting automation policy
  evaluateAutomationLogic();

  // 5. Output structured telemetry to Serial Monitor
  if (currentMillis - lastTelemetryPrint >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryPrint = currentMillis;
    printTelemetry();
  }
}

// ========================== HARDWARE INITIALIZATION ========================
void initHardware() {
  Serial.println(F("[INIT] Configuring NodeMCU GPIO pins..."));

  // LED Output on D6 (GPIO 12)
  pinMode(LED_PIN, OUTPUT);
  setLightState(false); // Ensure lighting starts in OFF state

  // PIR Motion Sensor Input on D5 (GPIO 14)
  pinMode(PIR_PIN, INPUT);

  // Note: A0 on ESP8266 is dedicated analog input; pinMode is optional but safe
  pinMode(LDR_PIN, INPUT);

  // Initialize DHT22 Sensor on D2 (GPIO 4)
  Serial.println(F("[INIT] Initializing DHT22 sensor..."));
  dht.begin();

  // Startup LED self-test flash: confirms LED polarity, 330-ohm resistor, and D6 drive
  Serial.println(F("[INIT] Performing LED self-test flash..."));
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

  // Validate readings: Never store a failed reading as 0.0
  if (isnan(temp) || isnan(hum)) {
    Serial.println(F("[WARN] DHT22 reading failed! Check D2 data wire, 3V3 power, and 10k pull-up."));
    temperatureC = NAN;
    humidityPct  = NAN;
  } else {
    temperatureC = temp;
    humidityPct  = hum;
  }

  // Read Analog Brightness from LDR on A0
  // ESP8266 ADC returns 10-bit integer: 0 (0.0V) to 1023 (3.3V on NodeMCU)
  ambientLightLevel = analogRead(LDR_PIN);
  // INVERTED: This LDR module pulls signal LOW when bright, HIGH when dark.
  // LOW ADC value (< threshold) = Bright room  -> isDark = false
  // HIGH ADC value (> threshold) = Dark room   -> isDark = true
  isDark = (ambientLightLevel > LDR_DARK_THRESHOLD);
}

// ========================== AUTOMATION LOGIC ===============================
void evaluateAutomationLogic() {
  // Handle Manual Mode Override
  if (manualMode) {
    if (isLightOn != manualLedState) {
      setLightState(manualLedState);
    }
    return;
  }

  /*
   * AUTOMATIC LIGHTING POLICY (with optical feedback hysteresis):
   * 
   * On a breadboard, the LED is near the LDR. If the LED turns ON in a dark room,
   * its own emitted light increases the LDR reading. If we naively turn the light OFF
   * when the room becomes bright, the LED would strobe on and off endlessly!
   * 
   * Standard industrial occupancy policy:
   * 1. If light is OFF: Turn ON when motion is detected AND room is DARK.
   * 2. If light is ON:  Keep ON while room remains occupied.
   * 3. Turn OFF when:   Occupancy timeout expires (room is empty) OR manual override.
   */
  if (!isLightOn) {
    // Light is OFF: Check conditions to turn ON
    if (isMotionDetected && isDark) {
      Serial.println(F("[AUTO] Motion detected in dark room -> Switching Light ON"));
      setLightState(true);
    }
  } else {
    // Light is ON: Turn OFF when room is vacant OR when room becomes bright
    if (!isMotionDetected) {
      Serial.println(F("[AUTO] Occupancy timeout elapsed (Room vacant) -> Switching Light OFF"));
      setLightState(false);
    } else if (!isDark) {
      // Room is occupied but now bright (e.g. sunlight / external light came on)
      // -> No need for artificial lighting
      Serial.println(F("[AUTO] Room is now BRIGHT (natural light detected) -> Switching Light OFF"));
      setLightState(false);
    }
  }
}

// ========================== ACTUATOR CONTROL ===============================
void setLightState(bool state) {
  isLightOn = state;
  // NodeMCU D6 (GPIO 12) drives HIGH to illuminate the LED
  digitalWrite(LED_PIN, state ? HIGH : LOW);
}

// ========================== TELEMETRY LOGGING ==============================
void printTelemetry() {
  Serial.print(F("[STATUS] Light: "));
  Serial.print(isLightOn ? F("ON ") : F("OFF"));
  Serial.print(manualMode ? F(" (MANUAL)") : F(" (AUTO)  "));

  Serial.print(F(" | Motion: "));
  Serial.print(isMotionDetected ? F("OCCUPIED  ") : F("VACANT    "));

  Serial.print(F(" | LDR A0: "));
  Serial.print(ambientLightLevel);
  Serial.print(isDark ? F(" (DARK) ") : F(" (BRIGHT)"));

  Serial.print(F(" | Temp: "));
  if (isnan(temperatureC)) {
    Serial.print(F("ERR   "));
  } else {
    Serial.print(temperatureC, 1);
    Serial.print(F(" C "));
  }

  Serial.print(F("| Humidity: "));
  if (isnan(humidityPct)) {
    Serial.print(F("ERR   "));
  } else {
    Serial.print(humidityPct, 1);
    Serial.print(F(" % "));
  }

  Serial.print(F("| Wi-Fi: "));
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(F("Connected (IP: "));
    Serial.print(WiFi.localIP());
    Serial.print(F(")"));
  } else if (strcmp(WIFI_SSID, "YOUR_WIFI_SSID") == 0) {
    Serial.print(F("Offline Test Mode"));
  } else {
    Serial.print(F("Disconnected/Connecting"));
  }

  Serial.println();
}

// ========================== NON-BLOCKING WI-FI =============================
void checkWiFiConnection() {
  // If credentials are placeholder, remain in offline standalone mode
  if (strcmp(WIFI_SSID, "YOUR_WIFI_SSID") == 0) {
    return;
  }

  // If Wi-Fi is disconnected, attempt background reconnection without blocking loop
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[WIFI] Reconnecting in background..."));
    WiFi.reconnect();
  }
}
