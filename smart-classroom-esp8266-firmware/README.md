# Smart Classroom Studio — Standalone ESP8266 Firmware

This folder contains the dedicated, standalone Arduino sketch for the **ESP8266 NodeMCU** board (ESP-12E / ESP-12F Module).

## Hardware Pin Mapping

| Peripheral | NodeMCU Pin | GPIO | Electrical Notes |
| :--- | :--- | :--- | :--- |
| **PIR Motion Sensor (OUT)** | **D5** | GPIO 14 | Digital Input (3.3V logic) |
| **DHT22 Sensor (DATA)** | **D2** | GPIO 4 | Bidirectional digital I/O |
| **Classroom LED (Anode)** | **D6** | GPIO 12 | Digital Output via 330Ω resistor; Cathode to GND |
| **LDR Analog Light (AO)** | **A0** | ADC0 | 10-bit analog input (0–1023) |

## Wi-Fi & Network Details
- **Access Point SSID:** `smart`
- **Access Point Password:** `12345678`
- **Default IP Address:** `192.168.4.1`

## API Endpoints (with CORS headers)
- `GET /api` — Returns JSON snapshot of all live sensor values and states.
- `GET /lightmode?value=auto|manual` — Configures lighting automation policy.
- `GET /led?value=on|off` — Manual hardware LED control.
- `GET /fan?value=auto|OFF|SLOW|MEDIUM|HIGH` — Updates firmware virtual fan state.
- `GET /settings?slow=..&medium=..&high=..&lightThreshold=..&timeout=..` — Updates RAM automation thresholds.

## How to Flash via Arduino IDE
1. Open `SmartClassroom_ESP8266.ino` in Arduino IDE.
2. Select **Tools > Board > NodeMCU 1.0 (ESP-12E Module)**.
3. Connect your NodeMCU via USB and select the corresponding COM port under **Tools > Port**.
4. Click **Upload**.
5. Open Serial Monitor at **115200 baud** to view real-time diagnostics.
