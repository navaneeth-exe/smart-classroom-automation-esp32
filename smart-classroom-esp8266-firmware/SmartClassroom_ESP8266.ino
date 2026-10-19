/*
 * ==============================================================================
 * Project: Smart Classroom Automation System - Standalone ESP8266 Firmware
 * Target Board: NodeMCU 1.0 (ESP-12E / ESP-12F Module)
 * 
 * Hardware Pin Mapping:
 * - PIR Motion Sensor:        NodeMCU D5 (GPIO 14)
 * - DHT22 Temp & Humidity:    NodeMCU D2 (GPIO 4)
 * - LED (Classroom Lighting): NodeMCU D6 (GPIO 12) via 330 ohm resistor
 * - LDR Ambient Light Sensor: NodeMCU A0 (ADC0, 0 - 3.3V, 10-bit: 0 - 1023)
 * 
 * API Endpoints (with CORS support for external web dashboard):
 * - GET /api          : Full telemetry & settings JSON
 * - GET /lightmode    : ?value=auto|manual
 * - GET /led          : ?value=on|off
 * - GET /fan          : ?value=auto|OFF|SLOW|MEDIUM|HIGH (virtual simulation)
 * - GET /settings     : ?slow=..&medium=..&high=..&lightThreshold=..&timeout=..
 * ==============================================================================
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DHT.h>
#include <math.h>

// ========================== HARDWARE PIN DEFINITIONS ==========================
#ifndef D2
  #define D2 4   // GPIO 4
#endif
#ifndef D5
  #define D5 14  // GPIO 14
#endif
#ifndef D6
  #define D6 12  // GPIO 12
#endif

#define PIR_PIN  D5
#define DHT_PIN  D2
#define DHT_TYPE DHT22
#define LED_PIN  D6
#define LDR_PIN  A0

// ========================== WI-FI AP CONFIGURATION ============================
const char* AP_SSID     = "smart";
const char* AP_PASSWORD = "12345678";

// ========================== OBJECT INITIALIZATIONS ============================
DHT dht(DHT_PIN, DHT_TYPE);
ESP8266WebServer server(80);

// ========================== CONFIGURABLE PARAMETERS ==========================
int lightThreshold = 900;
float slowThreshold = 25.0;
float mediumThreshold = 30.0;
float highThreshold = 35.0;
unsigned long noMotionTimeoutMs = 300000UL; // 5 minutes default (300 seconds)

// false for sensors that read higher values in the dark; true if lower in dark
const bool DARK_WHEN_BELOW = false;

// ========================== RUNTIME STATE VARIABLES ==========================
bool autoLight       = true;
bool manualLED       = false;
bool rawMotion       = false;
bool occupied        = false;
bool darkRoom        = false;
bool ledState        = false;
bool manualFan       = false;
String manualFanMode = "OFF";
String fanMode       = "OFF";
int fanPercent       = 0;

unsigned long lastMotionMs      = 0;
unsigned long lastDhtReadMs     = 0;
unsigned long lastTelemetryMs   = 0;
float temperature               = NAN;
float humidity                  = NAN;
int ldrValue                    = 0;

// ========================== CORS HELPER ======================================
// Enables cross-origin requests from the standalone React web dashboard
void setCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "*");
}

void handleOptions() {
  setCorsHeaders();
  server.send(204);
}

// ========================== HTTP HANDLERS ====================================
bool getFloatArg(const String& name, float& value) {
  if (!server.hasArg(name) || server.arg(name).length() == 0) return false;
  String raw = server.arg(name);
  char* endPtr = nullptr;
  value = strtof(raw.c_str(), &endPtr);
  return endPtr != raw.c_str() && *endPtr == '\0';
}

void handleRoot() {
  setCorsHeaders();
  String info = "{\"system\":\"Smart Classroom ESP8266\",\"status\":\"online\",\"api\":\"/api\"}";
  server.send(200, "application/json", info);
}

void handleApi() {
  setCorsHeaders();
  server.sendHeader("Cache-Control", "no-store");

  String json = "{";
  json += "\"temperature\":";
  json += isnan(temperature) ? "null" : String(temperature, 1);
  json += ",\"humidity\":";
  json += isnan(humidity) ? "null" : String(humidity, 1);
  json += ",\"ldr\":" + String(ldrValue);
  json += ",\"rawMotion\":" + String(rawMotion ? "true" : "false");
  json += ",\"occupied\":" + String(occupied ? "true" : "false");
  json += ",\"dark\":" + String(darkRoom ? "true" : "false");
  json += ",\"led\":" + String(ledState ? "true" : "false");
  json += ",\"autoLight\":" + String(autoLight ? "true" : "false");
  json += ",\"fanMode\":\"" + fanMode + "\"";
  json += ",\"fanAuto\":" + String(!manualFan ? "true" : "false");
  json += ",\"fanPercent\":" + String(fanPercent);
  json += ",\"slowThreshold\":" + String(slowThreshold, 1);
  json += ",\"mediumThreshold\":" + String(mediumThreshold, 1);
  json += ",\"highThreshold\":" + String(highThreshold, 1);
  json += ",\"lightThreshold\":" + String(lightThreshold);
  json += ",\"timeoutSeconds\":" + String(noMotionTimeoutMs / 1000UL);
  json += "}";

  server.send(200, "application/json", json);
}

void handleLightMode() {
  setCorsHeaders();
  if (server.hasArg("value")) {
    String value = server.arg("value");
    if (value == "auto") {
      autoLight = true;
    } else if (value == "manual") {
      autoLight = false;
      manualLED = ledState;
    }
  }
  server.send(200, "text/plain", "OK");
}

void handleLED() {
  setCorsHeaders();
  if (server.hasArg("value")) {
    String value = server.arg("value");
    autoLight = false;
    if (value == "on") manualLED = true;
    else if (value == "off") manualLED = false;
  }
  server.send(200, "text/plain", "OK");
}

void handleFan() {
  setCorsHeaders();
  if (server.hasArg("value")) {
    String value = server.arg("value");
    if (value == "auto") {
      manualFan = false;
    } else if (value == "OFF" || value == "SLOW" || value == "MEDIUM" || value == "HIGH") {
      manualFan = true;
      manualFanMode = value;
    }
  }
  server.send(200, "text/plain", "OK");
}

void handleSettings() {
  setCorsHeaders();
  float slow, medium, high, light, timeout;
  bool valid = getFloatArg("slow", slow) &&
               getFloatArg("medium", medium) &&
               getFloatArg("high", high) &&
               getFloatArg("lightThreshold", light) &&
               getFloatArg("timeout", timeout);

  // Validate settings ranges (10-bit ADC 0-1023)
  valid = valid && slow >= 0 && medium > slow && high > medium &&
          light >= 0 && light <= 1023 && timeout >= 5 && timeout <= 3600;

  if (valid) {
    slowThreshold = slow;
    mediumThreshold = medium;
    highThreshold = high;
    lightThreshold = (int)light;
    noMotionTimeoutMs = (unsigned long)timeout * 1000UL;
  }
  server.send(200, "application/json", String("{\"ok\":") + (valid ? "true" : "false") + "}");
}

// ========================== HARDWARE & LOGIC PROCESSING =====================
void updateSensorsAndOutputs() {
  unsigned long now = millis();

  // 1. PIR Motion Polling
  rawMotion = (digitalRead(PIR_PIN) == HIGH);
  if (rawMotion) {
    lastMotionMs = now;
  }
  occupied = (lastMotionMs != 0 && (now - lastMotionMs <= noMotionTimeoutMs));

  // 2. LDR Analog Reading (10-bit ADC on ESP8266 A0)
  ldrValue = analogRead(LDR_PIN);
  darkRoom = DARK_WHEN_BELOW ? (ldrValue < lightThreshold) : (ldrValue > lightThreshold);

  // 3. DHT22 Temperature & Humidity (read every 2 seconds)
  if (lastDhtReadMs == 0 || now - lastDhtReadMs >= 2000UL) {
    lastDhtReadMs = now;
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (!isnan(t)) temperature = t;
    if (!isnan(h)) humidity = h;
  }

  // 4. Lighting Automation Logic
  if (autoLight) {
    // Turn ON if occupied and dark; turn OFF if room vacant OR room becomes bright
    if (!ledState) {
      if (occupied && darkRoom) {
        ledState = true;
      }
    } else {
      if (!occupied || !darkRoom) {
        ledState = false;
      }
    }
  } else {
    ledState = manualLED;
  }
  digitalWrite(LED_PIN, ledState ? HIGH : LOW);

  // 5. Virtual Fan Speed Simulation
  if (manualFan) {
    fanMode = manualFanMode;
  } else if (isnan(temperature) || temperature < slowThreshold) {
    fanMode = "OFF";
  } else if (temperature < mediumThreshold) {
    fanMode = "SLOW";
  } else if (temperature < highThreshold) {
    fanMode = "MEDIUM";
  } else {
    fanMode = "HIGH";
  }

  if (fanMode == "SLOW") fanPercent = 33;
  else if (fanMode == "MEDIUM") fanPercent = 66;
  else if (fanMode == "HIGH") fanPercent = 100;
  else fanPercent = 0;
}

// ========================== SETUP ============================================
void setup() {
  Serial.begin(115200);
  delay(150);

  Serial.println();
  Serial.println(F("========================================================"));
  Serial.println(F(" Smart Classroom Automation - Standalone ESP8266 Server "));
  Serial.println(F("========================================================"));

  // Pin initialization
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // Sensor start
  dht.begin();

  // LED self-test flash
  digitalWrite(LED_PIN, HIGH);
  delay(200);
  digitalWrite(LED_PIN, LOW);

  // Start Wi-Fi Access Point
  WiFi.mode(WIFI_AP);
  bool apStarted = WiFi.softAP(AP_SSID, AP_PASSWORD);
  Serial.print(F("Wi-Fi Access Point: "));
  Serial.println(apStarted ? F("Started successfully") : F("FAILED to start"));
  Serial.print(F("SSID: "));
  Serial.println(AP_SSID);
  Serial.print(F("Password: "));
  Serial.println(AP_PASSWORD);
  Serial.print(F("ESP8266 AP IP Address: "));
  Serial.println(WiFi.softAPIP());

  // Register WebServer Endpoints
  server.on("/", HTTP_GET, handleRoot);
  server.on("/api", HTTP_GET, handleApi);
  server.on("/lightmode", HTTP_GET, handleLightMode);
  server.on("/led", HTTP_GET, handleLED);
  server.on("/fan", HTTP_GET, handleFan);
  server.on("/settings", HTTP_GET, handleSettings);

  // OPTIONS handler for CORS preflight requests
  server.onNotFound([]() {
    if (server.method() == HTTP_OPTIONS) {
      handleOptions();
    } else {
      setCorsHeaders();
      server.send(404, "text/plain", "Not Found");
    }
  });

  server.begin();
  Serial.println(F("HTTP REST API Server running on port 80."));
  Serial.println(F("Ready to receive requests from standalone React website."));
}

// ========================== MAIN LOOP ========================================
void loop() {
  server.handleClient();
  updateSensorsAndOutputs();

  // Telemetry log to Serial Monitor once every 2 seconds
  unsigned long now = millis();
  if (now - lastTelemetryMs >= 2000UL) {
    lastTelemetryMs = now;
    Serial.print(F("[ESP8266] Temp: "));
    if (isnan(temperature)) Serial.print(F("ERR"));
    else Serial.print(temperature, 1);
    Serial.print(F(" C | LDR: "));
    Serial.print(ldrValue);
    Serial.print(F(" | Occ: "));
    Serial.print(occupied ? F("YES") : F("NO"));
    Serial.print(F(" | Light: "));
    Serial.print(ledState ? F("ON") : F("OFF"));
    Serial.print(F(" | Fan: "));
    Serial.println(fanMode);
  }

  delay(5);
}
