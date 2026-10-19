# Smart Classroom Studio — Standalone ESP32 Firmware

This folder contains the dedicated, standalone Arduino sketch for the **ESP32 Development Board** (ESP-WROOM-32 / 30-pin or 38-pin DevKit).

## Hardware Pin Mapping

| Peripheral | Board Pin | Electrical Notes |
| :--- | :--- | :--- |
| **PIR Motion Sensor (OUT)** | **GPIO 19** | Digital Input (3.3V logic) |
| **DHT22 Sensor (DATA)** | **GPIO 4** | Bidirectional single-wire digital I/O |
| **Classroom LED (Anode)** | **GPIO 18** | Digital Output via 330Ω resistor; Cathode to GND |
| **LDR Analog Light (AO)** | **GPIO 34** | ADC1_CH6 (Analog Input 0–3.3V, 12-bit: 0–4095). Safe to use while Wi-Fi is active. |

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
1. Open `SmartClassroom_ESP32.ino` in Arduino IDE.
2. Select **Tools > Board > ESP32 Dev Module** (or your specific ESP32 variant).
3. Connect your ESP32 via USB and select the corresponding COM port under **Tools > Port**.
4. Click **Upload**.
5. Open Serial Monitor at **115200 baud** to view real-time diagnostics.
