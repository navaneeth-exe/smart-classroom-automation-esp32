# Smart Classroom Automation System (ESP32 / ESP8266 + 3D Web Studio)

An IoT smart classroom automation system featuring an interactive WebGL 3D ceiling fan, ambient sensor telemetry (temperature, humidity, motion, light level), and automated/manual LED lighting control.

---

## 📁 Repository Structure — Which Files to Use

```text
smart-classroom-automation-esp32/
├── smart-classroom-esp32-firmware/       <-- ⭐ USE FOR ESP32 BOARD
│   └── SmartClassroom_ESP32.ino          <-- Main Arduino sketch for ESP32
│
├── smart-classroom-esp8266-firmware/     <-- ⭐ USE FOR NodeMCU / ESP8266 BOARD
│   └── SmartClassroom_ESP8266.ino        <-- Main Arduino sketch for ESP8266
│
├── smart-classroom-website/              <-- ⭐ WEB DASHBOARD (React + Three.js)
│   ├── src/                              <-- Frontend UI components & 3D WebGL engine
│   ├── public/                           <-- Static assets & classroom textures
│   ├── package.json
│   └── vite.config.js
│
├── Archive_Old_Versions/                 <-- Legacy reference files and backups
└── README.md                             <-- Quick start guide (this file)
```

---

## 🚀 How to Run the Website (Quick Start for Teammates)

### Prerequisites
- Install **Node.js** (v18 or higher recommended): [https://nodejs.org](https://nodejs.org)

### Step 1: Navigate to the website directory
Open a terminal in the project root and navigate to `smart-classroom-website`:
```bash
cd smart-classroom-website
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Start the local development server
```bash
npm run dev
```

### Step 4: Open in browser
Open your browser and navigate to:
```text
http://localhost:5173/
```

### 💡 Previewing Without Hardware (Isolated Test Mode)
If you don't have the ESP32 physically connected:
1. Open `http://localhost:5173/`.
2. Click **"Enable Test Mode"** in the top banner or bottom of the sidebar.
3. This displays simulated real-time fixtures (28.4°C temperature, motion detection, light sensor, and animated 3D fan) so you can test all UI controls and animations immediately.

---

## 🔌 Hardware Setup & Microcontroller Firmware

### Board Option A: ESP32 (Recommended)
- **Folder:** `smart-classroom-esp32-firmware/`
- **Sketch File:** `smart-classroom-esp32-firmware/SmartClassroom_ESP32.ino`
- **Pin Connections:**
  - **LED (Relay / Lighting):** `GPIO 18` (in series with 330Ω resistor to ground)
  - **PIR Motion Sensor:** `GPIO 19`
  - **DHT22 Temperature & Humidity Sensor:** `GPIO 4`
  - **LDR Ambient Light Sensor:** `GPIO 34` (ADC1 channel, Wi-Fi safe)

### Board Option B: ESP8266 (NodeMCU)
- **Folder:** `smart-classroom-esp8266-firmware/`
- **Sketch File:** `smart-classroom-esp8266-firmware/SmartClassroom_ESP8266.ino`
- **Pin Connections:**
  - **LED:** `D6` (`GPIO 12`)
  - **PIR Motion Sensor:** `D5` (`GPIO 14`)
  - **DHT22:** `D2` (`GPIO 4`)
  - **LDR:** `A0` (Analog Input)

### Arduino IDE Required Libraries
1. `DHT sensor library` by Adafruit
2. `Adafruit Unified Sensor`

---

## 📶 Connecting the Website to Physical ESP32 / ESP8266

1. Flash the sketch to your board using Arduino IDE.
2. The board starts a Wi-Fi Access Point:
   - **SSID:** `smart`
   - **Password:** `12345678`
   - **Default IP:** `http://192.168.4.1`
3. On your laptop / PC, connect to the Wi-Fi network `smart`.
4. Open the web dashboard at `http://localhost:5173/`.
5. The system will automatically detect the board, display **"ESP32 Online"**, and stream live telemetry in real-time!

---

## 🌟 Key Features
- **Realistic 3D WebGL Virtual Ceiling Fan:** Three.js model with stationary canopy/rod and independently rotating aerodynamic rotor with physical momentum and inertia.
- **Thermal Velocity Automation:**
  - Below `25.0°C` → **OFF**
  - `25.0°C` to `<28.0°C` → **LOW**
  - `28.0°C` to `<31.0°C` → **MEDIUM**
  - `≥ 31.0°C` → **HIGH**
- **Hardware LED Actuator:** Real-time physical toggle on GPIO 18 with confirmed state detection.
- **Ambient Lighting Logic:** Automatic turn-off when ambient room lighting becomes bright.
- **Live Event Audit Log:** Chronological activity recording for classroom compliance and occupancy monitoring.
