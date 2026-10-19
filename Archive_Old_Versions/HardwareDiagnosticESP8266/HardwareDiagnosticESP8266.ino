/*
 * ==============================================================================
 * Project: Hardware Diagnostic & Step-by-Step Item Tester
 * Board: ESP8266 NodeMCU
 * 
 * Purpose:
 * Tests each component individually to verify wiring BEFORE running the full
 * automation firmware:
 *   1. LED Blink Test on D6
 *   2. LDR Analog Light Reading on A0
 *   3. PIR Motion Detection on D5
 *   4. DHT22 Temperature & Humidity on D2
 * ==============================================================================
 */

#include <DHT.h>

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

// Pin Definitions matching your NodeMCU configuration
#define DHT_PIN   D2   // GPIO 4  - DHT22 DATA
#define PIR_PIN   D5   // GPIO 14 - PIR OUT
#define LED_PIN   D6   // GPIO 12 - LED via 330 ohm resistor
#define LDR_PIN   A0   // ADC0    - LDR Analog Input

#define DHTTYPE DHT22
DHT dht(DHT_PIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  delay(1500);

  Serial.println();
  Serial.println(F("======================================================"));
  Serial.println(F("     ESP8266 STEP-BY-STEP HARDWARE DIAGNOSTIC TOOL    "));
  Serial.println(F("======================================================"));

  // Initialize pins
  pinMode(LED_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);

  // ------------------------------------------------------------------
  // STEP 1: TEST THE LED (Pin D6)
  // ------------------------------------------------------------------
  Serial.println(F("\n[STEP 1] Testing LED on pin D6..."));
  Serial.println(F(" -> Turning LED ON for 2 seconds..."));
  digitalWrite(LED_PIN, HIGH);
  delay(2000);

  Serial.println(F(" -> Turning LED OFF for 1 second..."));
  digitalWrite(LED_PIN, LOW);
  delay(1000);

  Serial.println(F(" [CHECK] Did the LED blink ON and OFF?"));
  Serial.println(F("         YES -> LED wiring and resistor are correct."));
  Serial.println(F("         NO  -> Check LED polarity (long leg to D6) or GND.\n"));

  // ------------------------------------------------------------------
  // STEP 2: INITIALIZE DHT22 (Pin D2)
  // ------------------------------------------------------------------
  Serial.println(F("[STEP 2] Initializing DHT22 on pin D2..."));
  dht.begin();
  delay(2000); // DHT22 requires 2 seconds to warm up
  
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    Serial.println(F(" [CHECK] DHT22 STATUS: FAILED!"));
    Serial.println(F("         Fix: Check D2 wire, 3V3 power, GND, and 10k pull-up resistor."));
  } else {
    Serial.print(F(" [CHECK] DHT22 STATUS: SUCCESS! -> Temp: "));
    Serial.print(t, 1);
    Serial.print(F(" C | Humidity: "));
    Serial.print(h, 1);
    Serial.println(F(" %"));
  }

  Serial.println(F("\n------------------------------------------------------"));
  Serial.println(F(" Entering LIVE Continuous Monitor for all sensors:    "));
  Serial.println(F("  - Cover LDR with hand to see A0 values drop/change. "));
  Serial.println(F("  - Wave hand over PIR to trigger motion detection.   "));
  Serial.println(F("------------------------------------------------------\n"));
}

unsigned long lastPrintTime = 0;

void loop() {
  unsigned long currentMillis = millis();

  // Read and print every 1.5 seconds
  if (currentMillis - lastPrintTime >= 1500) {
    lastPrintTime = currentMillis;

    // 1. Read LDR (A0)
    int ldrValue = analogRead(LDR_PIN);
    String lightCondition = (ldrValue < 500) ? "DARK  " : "BRIGHT";

    // 2. Read PIR (D5)
    int pirState = digitalRead(PIR_PIN);
    String motionStatus = (pirState == HIGH) ? "MOTION DETECTED" : "NO MOTION      ";

    // Visual feedback: Light up LED if motion is detected during test
    digitalWrite(LED_PIN, (pirState == HIGH) ? HIGH : LOW);

    // 3. Read DHT22 (D2)
    float t = dht.readTemperature();
    float h = dht.readHumidity();

    // 4. Print clean diagnostic row
    Serial.print(F("[LIVE TEST] LDR (A0): "));
    Serial.print(ldrValue);
    Serial.print(F(" ["));
    Serial.print(lightCondition);
    Serial.print(F("] | PIR (D5): "));
    Serial.print(motionStatus);
    Serial.print(F(" | DHT22: "));

    if (isnan(t) || isnan(h)) {
      Serial.print(F("ERR (Check wire)"));
    } else {
      Serial.print(t, 1);
      Serial.print(F(" C, "));
      Serial.print(h, 1);
      Serial.print(F(" %"));
    }

    Serial.print(F(" | LED (D6): "));
    Serial.println((pirState == HIGH) ? F("ON (with motion)") : F("OFF"));
  }
}
