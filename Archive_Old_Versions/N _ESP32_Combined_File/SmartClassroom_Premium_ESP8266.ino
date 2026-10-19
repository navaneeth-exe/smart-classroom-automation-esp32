/*
  Smart Classroom Automation System - ESP8266 NodeMCU
  Features:
  - ESP8266 hosts a responsive dashboard at http://192.168.4.1
  - PIR occupancy, LDR brightness, DHT22 temperature/humidity
  - Automatic/manual LED control
  - Virtual fan with OFF/SLOW/MEDIUM/HIGH modes (no physical fan)
  - Editable temperature/light/occupancy settings
  - Settings are held in RAM and reset on restart

  Wiring:
    PIR OUT -> D5 (GPIO14), PIR GND -> GND, PIR VCC per module requirements
    DHT22 DATA -> D2 (GPIO4), VCC -> 3V3, GND -> GND
    LDR module AO -> A0, VCC -> compatible supply, GND -> GND
    LED D6 (GPIO12) -> 330 ohm resistor -> LED anode; LED cathode -> GND
  IMPORTANT:
    - ESP8266 GPIO inputs must not receive more than 3.3 V.
    - Check the NodeMCU A0 voltage range and ensure the LDR AO output is safe.
    - Bare DHT22 may need a 4.7k-10k pull-up resistor from DATA to 3V3.
*/

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DHT.h>
#include <math.h>

const char* AP_SSID = "smart";
const char* AP_PASSWORD = "12345678";

#define PIR_PIN D5
#define DHT_PIN D2
#define DHT_TYPE DHT22
#define LED_PIN D6
#define LDR_PIN A0

DHT dht(DHT_PIN, DHT_TYPE);
ESP8266WebServer server(80);

// Default settings
int lightThreshold = 900;
float slowThreshold = 25.0;
float mediumThreshold = 30.0;
float highThreshold = 35.0;
unsigned long noMotionTimeoutMs = 300000UL; // 5 minutes
const bool DARK_WHEN_BELOW = false; // Change to false if your LDR reads higher in darkness

// Runtime state
bool autoLight = true;
bool manualLED = false;
bool rawMotion = false;
bool occupied = false;
bool darkRoom = false;
bool ledState = false;
bool manualFan = false;
String manualFanMode = "OFF";
String fanMode = "OFF";
int fanPercent = 0;

unsigned long lastMotionMs = 0;
unsigned long lastDhtReadMs = 0;
float temperature = NAN;
float humidity = NAN;
int ldrValue = 0;

const char DASHBOARD[] PROGMEM = R"HTML(
<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#111b31"><title>Smart Classroom</title>
<style>
:root{--bg:#f3f5fa;--surface:#fff;--ink:#172033;--muted:#718096;--line:#e6eaf1;--nav:#111b31;--blue:#536dfe;--green:#15966a;--amber:#c78318;--red:#d64b5d;--shadow:0 12px 35px rgba(20,35,70,.07)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.45 Arial,Helvetica,sans-serif}
header{background:var(--nav);color:#fff;padding:22px clamp(16px,4vw,42px);display:flex;justify-content:space-between;align-items:center;gap:12px}
header h1{font-size:24px;margin:0;letter-spacing:-.6px}header p{font-size:12px;color:#cbd5e1;margin:5px 0 0}
.demo{background:#263657;color:#e4eaff;border-radius:99px;padding:8px 11px;font-size:10px;font-weight:bold;white-space:nowrap}
main{max-width:1200px;margin:auto;padding:22px clamp(12px,3vw,36px)}
.hero{background:linear-gradient(115deg,#243b79,#536dfe 72%,#8091ff);color:white;border-radius:18px;padding:22px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:14px}
.eyebrow{font-size:10px;letter-spacing:1.5px;color:#dce4ff;font-weight:bold}.hero h2{margin:7px 0;font-size:22px}.hero p{margin:0;color:#e0e7ff;font-size:13px}.heroIcon{font-size:38px}
.sectionHead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:22px 0 12px}.sectionHead h2{font-size:16px;margin:0}.muted{font-size:11px;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}.card{background:var(--surface);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow);padding:17px;min-width:0}
.metricTop{display:flex;justify-content:space-between;align-items:center;gap:8px}.metricIcon{width:39px;height:39px;display:grid;place-items:center;border-radius:12px;background:#e8edff;color:#536dfe;font-size:19px}.greenBg{background:#e1f7ee;color:#13875f}.amberBg{background:#fff3db;color:#b97a13}.violetBg{background:#f0e8ff;color:#8252ce}
.label{font-size:12px;color:var(--muted);margin-top:13px}.value{font-size:26px;font-weight:bold;letter-spacing:-.7px;margin:3px 0 5px}.foot{font-size:11px;color:var(--muted)}.tag{display:inline-block;padding:5px 8px;border-radius:8px;background:#f0f3fa;color:#65728a;font-size:10px;font-weight:bold;white-space:nowrap}.tag.good{background:#e0f7ec;color:#16815d}.tag.warn{background:#fff2d8;color:#a66a0c}
.twoCol{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-top:15px}.cardTitle{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:15px}.cardTitle h3{font-size:15px;margin:0}.cardTitle p{font-size:11px;color:var(--muted);margin:4px 0 0}
.row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 0;border-top:1px solid #edf0f6}.row:first-of-type{border-top:0}.info{display:flex;align-items:center;gap:10px;min-width:0}.ico{width:35px;height:35px;display:grid;place-items:center;background:#f0f3fb;border-radius:10px;flex-shrink:0}.info strong{font-size:12px;display:block}.info small{font-size:10px;color:var(--muted);display:block;margin-top:3px}
button,input{font:inherit}button{cursor:pointer;border:0;border-radius:9px;padding:10px 12px;font-size:11px;font-weight:bold;background:var(--blue);color:white}button.soft{background:#eef1fb;color:#4258b5}button.outline{background:white;border:1px solid var(--line);color:#59677f}button.danger{background:#b93849;color:white}
.switch{border:0;background:#d5dbe6;border-radius:99px;width:43px;height:25px;padding:3px;flex-shrink:0}.switch:after{content:"";display:block;width:19px;height:19px;border-radius:50%;background:white;box-shadow:0 1px 4px #0002;transition:.2s}.switch.on{background:var(--blue)}.switch.on:after{transform:translateX(18px)}
.fanDisplay{display:flex;align-items:center;gap:15px;padding:8px 0 15px}.fanCircle{width:78px;height:78px;flex-shrink:0;display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle,#f8faff 45%,#e9edff 46%,#e9edff 68%,#f8faff 69%);border:1px solid #e2e7ff;color:#5269e8;font-size:34px}.spin{animation:spin 2s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.fanName{font-size:24px;font-weight:bold}.track{height:7px;background:#edf0f6;border-radius:99px;overflow:hidden;margin:10px 0 6px}.fill{height:100%;background:linear-gradient(90deg,#7186ff,#4359db);border-radius:99px;width:0;transition:width .2s}.trackLabels{display:flex;justify-content:space-between;color:#8a95a8;font-size:10px}.fanButtons{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:14px}.fanButtons button{padding:10px 2px;background:white;border:1px solid #e0e5f0;color:#64718a;font-size:10px}.fanButtons button.sel{background:#e9edff;color:#4359ce;border-color:#cdd5ff}
.bulb{width:52px;height:52px;display:grid;place-items:center;border-radius:15px;background:#f0f3fb;font-size:27px}.bulb.on{background:#fff0b8;box-shadow:0 0 0 4px #fff8e5}.lightSum{display:flex;align-items:center;gap:12px;padding:7px 0 14px}.lightSum strong{display:block;font-size:16px}.lightSum small{font-size:10px;color:var(--muted)}
.btns{display:flex;gap:7px;flex-wrap:wrap;margin-top:13px}.sensor{padding:12px 0;border-top:1px solid #edf0f6}.sensor:first-of-type{border-top:0}.sensorHead{display:flex;justify-content:space-between;gap:10px;font-size:11px}.bar{height:5px;background:#edf0f6;border-radius:99px;overflow:hidden;margin-top:7px}.bar span{height:100%;display:block;background:#7d8dff;border-radius:99px}
.settings{display:grid;grid-template-columns:1fr 1fr;gap:12px}.field label{display:block;font-size:11px;color:var(--muted);margin-bottom:6px}.field input{width:100%;border:1px solid #dfe4ee;border-radius:9px;padding:10px;background:#fff;color:var(--ink);outline:none}.field input:focus{border-color:#8090ff}
.note{font-size:11px;color:var(--muted);line-height:1.5;margin:13px 0 0}.bottom{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-top:15px}.activity{display:flex;gap:10px;padding:8px 0}.activityIcon{width:30px;height:30px;border-radius:9px;background:#edf1ff;display:grid;place-items:center;flex-shrink:0}.activity strong{font-size:11px;display:block}.activity small{font-size:10px;color:var(--muted)}
footer{display:flex;justify-content:space-between;gap:10px;color:#8a95a8;font-size:10px;padding:22px 3px}
@media(max-width:950px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.twoCol,.bottom{grid-template-columns:1fr}}
@media(max-width:520px){header{padding:17px 14px}header h1{font-size:20px}main{padding:13px 10px}.hero{padding:17px}.hero h2{font-size:19px}.heroIcon{display:none}.grid{gap:8px}.card{padding:13px;border-radius:14px}.value{font-size:23px}.metricIcon{width:34px;height:34px}.fanCircle{width:68px;height:68px;font-size:29px}.settings{gap:9px}.fanButtons button{font-size:9px}footer{flex-direction:column}}
</style></head><body>
<header><div><h1>⌘ ClassroomOS</h1><p>SMART CLASSROOM AUTOMATION</p></div><span class="demo">● LIVE DASHBOARD</span></header>
<main>
<section class="hero"><div><div class="eyebrow">CLASSROOM / OVERVIEW</div><h2>A smarter space to learn.</h2><p>Monitor your classroom environment and explore automation controls.</p></div><div class="heroIcon">☀</div></section>
<div class="sectionHead"><h2>Environment overview</h2><span class="muted" id="updated">Connecting...</span></div>
<section class="grid">
 <div class="card"><div class="metricTop"><div class="metricIcon">♨</div><span class="tag good" id="tempBadge">NORMAL</span></div><div class="label">Temperature</div><div class="value"><span id="temp">--</span> <span style="font-size:14px;color:#718096">°C</span></div><div class="foot">DHT22 sensor</div></div>
 <div class="card"><div class="metricTop"><div class="metricIcon greenBg">◉</div><span class="tag good">SENSOR</span></div><div class="label">Relative humidity</div><div class="value"><span id="humidity">--</span><span style="font-size:14px;color:#718096"> %</span></div><div class="foot">DHT22 sensor</div></div>
 <div class="card"><div class="metricTop"><div class="metricIcon amberBg">♙</div><span class="tag good" id="occBadge">ACTIVE</span></div><div class="label">Classroom occupancy</div><div class="value" id="occupancy">--</div><div class="foot" id="motionText">PIR motion sensor</div></div>
 <div class="card"><div class="metricTop"><div class="metricIcon violetBg">☼</div><span class="tag" id="lightBadge">--</span></div><div class="label">Ambient light</div><div class="value"><span id="ldr">--</span><span style="font-size:12px;color:#718096"> ADC</span></div><div class="foot" id="lightText">LDR sensor</div></div>
</section>
<div class="sectionHead"><h2>Automation controls</h2><span class="muted">Responsive control panel</span></div>
<section class="twoCol">
 <div class="card"><div class="cardTitle"><div><h3>Climate control</h3><p>Temperature-based fan simulation</p></div><span class="tag" id="fanAutoTag">AUTO</span></div>
  <div class="fanDisplay"><div class="fanCircle" id="fanIcon">✣</div><div><div class="fanName" id="fanMode">--</div><div class="muted" id="fanDesc">Simulated fan output</div><span class="tag good" id="fanTemp" style="margin-top:7px">-- °C</span></div></div>
  <div class="track"><div class="fill" id="fanFill"></div></div><div class="trackLabels"><span>0%</span><span>50%</span><span>100%</span></div>
  <div class="fanButtons"><button data-fan="OFF" class="outline">OFF</button><button data-fan="SLOW" class="outline">SLOW</button><button data-fan="MEDIUM" class="outline">MEDIUM</button><button data-fan="HIGH" class="outline">HIGH</button></div>
  <div class="row"><div class="info"><div class="ico">↻</div><div><strong>Automatic fan</strong><small>Adjust speed by temperature</small></div></div><button class="switch on" id="fanAuto" aria-label="Automatic fan"></button></div>
  <p class="note">Fan speed is simulated in software. No physical fan is connected.</p>
 </div>
 <div class="card"><div class="cardTitle"><div><h3>Lighting control</h3><p>Motion and brightness automation</p></div><span class="tag good" id="ledMode">AUTO</span></div>
  <div class="lightSum"><div class="bulb" id="bulb">☼</div><div><strong id="ledState">--</strong><small id="ledReason">Waiting for sensor data</small></div></div>
  <div class="row"><div class="info"><div class="ico">♙</div><div><strong>PIR motion sensor</strong><small>Classroom presence</small></div></div><span class="tag" id="pirBadge">--</span></div>
  <div class="row"><div class="info"><div class="ico">☼</div><div><strong>Automatic lighting</strong><small>On when occupied and dark</small></div></div><button class="switch on" id="lightAuto" aria-label="Automatic lighting"></button></div>
  <div class="btns"><button id="ledOn">Turn light ON</button><button class="danger" id="ledOff">Turn light OFF</button></div>
  <p class="note">Manual LED control overrides automatic mode. The LED output is on D6.</p>
 </div>
</section>
<section class="bottom">
 <div class="card"><div class="cardTitle"><div><h3>Sensor readings</h3><p>Current values from the hardware</p></div><span class="tag">LIVE</span></div>
  <div class="sensor"><div class="sensorHead"><strong>Temperature</strong><span id="tempRead">--</span></div><div class="bar"><span id="tempBar" style="width:40%"></span></div></div>
  <div class="sensor"><div class="sensorHead"><strong>Humidity</strong><span id="humidityRead">--</span></div><div class="bar"><span id="humidityBar" style="width:50%;background:#51b995"></span></div></div>
  <div class="sensor"><div class="sensorHead"><strong>LDR analog value</strong><span id="ldrRead">--</span></div><div class="bar"><span id="ldrBar" style="width:50%;background:#e8b34d"></span></div></div>
  <div class="sensor"><div class="sensorHead"><strong>PIR motion state</strong><span id="pirRead">--</span></div><div class="bar"><span id="pirBar" style="width:20%;background:#8a77df"></span></div></div>
  <p class="note">If the LDR dark/bright label is reversed, change DARK_WHEN_BELOW in the sketch.</p>
 </div>
 <div class="card"><div class="cardTitle"><div><h3>Automation settings</h3><p>Adjust control thresholds</p></div><span class="tag">CONFIG</span></div>
  <form id="settingsForm"><div class="settings">
   <div class="field"><label for="slow">SLOW starts (°C)</label><input id="slow" type="number" min="0" max="60" step=".5" value="25" required></div>
   <div class="field"><label for="medium">MEDIUM starts (°C)</label><input id="medium" type="number" min="0" max="60" step=".5" value="30" required></div>
   <div class="field"><label for="high">HIGH starts (°C)</label><input id="high" type="number" min="0" max="60" step=".5" value="35" required></div>
   <div class="field"><label for="lightThreshold">Darkness threshold</label><input id="lightThreshold" type="number" min="0" max="1023" value="500" required></div>
   <div class="field" style="grid-column:1/-1"><label for="timeout">No-motion timeout (seconds)</label><input id="timeout" type="number" min="5" max="3600" value="300" required></div>
  </div><div class="btns"><button type="submit">Apply settings</button><span class="muted" id="settingsMsg" style="align-self:center">Defaults active</span></div></form>
  <p class="note">Settings reset to defaults after a board restart.</p>
 </div>
</section>
<div class="card" style="margin-top:15px"><div class="cardTitle"><div><h3>Connection information</h3><p>Local Wi-Fi dashboard</p></div><span class="tag good">ESP8266 AP</span></div><div class="row"><div class="info"><div class="ico">⌁</div><div><strong>Wi-Fi network</strong><small>Connect your phone or laptop to this network</small></div></div><strong style="font-size:12px">SmartClassroom</strong></div><div class="row"><div class="info"><div class="ico">↗</div><div><strong>Dashboard address</strong><small>Enter this address in your browser</small></div></div><strong style="font-size:12px">192.168.4.1</strong></div><p class="note">This website is hosted on the ESP8266. It works while connected to its Wi-Fi access point and does not require internet access.</p></div>
<footer><span>CLASSROOMOS · SMART CLASSROOM AUTOMATION</span><span>ESP8266 local dashboard</span></footer>
</main>
<script>
let lastUpdate=0;
async function request(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error('Request failed');return r}
async function refresh(){
 try{
  const d=await (await request('/api')).json();
  const temp=d.temperature,hum=d.humidity;
  document.getElementById('temp').textContent=temp===null?'--':Number(temp).toFixed(1);
  document.getElementById('humidity').textContent=hum===null?'--':Math.round(hum);
  document.getElementById('ldr').textContent=d.ldr;
  document.getElementById('occupancy').textContent=d.occupied?'Occupied':'Empty';
  document.getElementById('motionText').textContent=d.rawMotion?'Motion detected now':d.occupied?'Motion detected recently':'No recent motion';
  document.getElementById('occBadge').textContent=d.occupied?'ACTIVE':'EMPTY';
  document.getElementById('occBadge').className='tag '+(d.occupied?'good':'warn');
  document.getElementById('lightBadge').textContent=d.dark?'LOW LIGHT':'BRIGHT';
  document.getElementById('lightBadge').className='tag '+(d.dark?'warn':'good');
  document.getElementById('lightText').textContent=d.dark?'Room is dark':'Room is bright';
  document.getElementById('tempBadge').textContent=temp===null?'SENSOR ERROR':temp>=d.highThreshold?'HIGH':temp>=d.mediumThreshold?'WARM':'NORMAL';
  document.getElementById('tempBadge').className='tag '+(temp!==null&&temp>=d.highThreshold?'warn':'good');
  document.getElementById('tempRead').textContent=temp===null?'Error':Number(temp).toFixed(1)+' °C';
  document.getElementById('humidityRead').textContent=hum===null?'Error':Math.round(hum)+' %';
  document.getElementById('ldrRead').textContent=d.ldr+' / 1023';
  document.getElementById('pirRead').textContent=d.rawMotion?'Motion active':d.occupied?'Recently active':'No motion';
  document.getElementById('tempBar').style.width=(temp===null?0:Math.max(0,Math.min(100,temp/50*100)))+'%';
  document.getElementById('humidityBar').style.width=(hum===null?0:Math.max(0,Math.min(100,hum)))+'%';
  document.getElementById('ldrBar').style.width=(d.ldr/1023*100)+'%';
  document.getElementById('pirBar').style.width=d.rawMotion?'100%':d.occupied?'60%':'10%';
  document.getElementById('ledState').textContent=d.led?'Light is ON':'Light is OFF';
  document.getElementById('ledState').style.color=d.led?'#15966a':'#d64b5d';
  document.getElementById('bulb').classList.toggle('on',d.led);
  document.getElementById('ledReason').textContent=d.autoLight?(d.occupied&&d.dark?'Motion detected · low light':!d.occupied?'No recent motion':'Room is bright'):'Manual control enabled';
  document.getElementById('ledMode').textContent=d.autoLight?'AUTO':'MANUAL';
  document.getElementById('lightAuto').classList.toggle('on',d.autoLight);
  document.getElementById('fanAuto').classList.toggle('on',d.fanAuto);
  document.getElementById('fanAutoTag').textContent=d.fanAuto?'AUTO MODE':'MANUAL MODE';
  document.getElementById('fanMode').textContent=d.fanMode;
  document.getElementById('fanDesc').textContent=d.fanAuto?'Based on temperature':'Manual demo setting';
  document.getElementById('fanTemp').textContent=temp===null?'Sensor error':Number(temp).toFixed(1)+' °C';
  document.getElementById('fanFill').style.width=d.fanPercent+'%';
  document.getElementById('fanIcon').classList.toggle('spin',d.fanMode!=='OFF');
  document.querySelectorAll('[data-fan]').forEach(b=>b.classList.toggle('sel',!d.fanAuto&&b.dataset.fan===d.fanMode));
  if(!document.getElementById('slow').matches(':focus')&&!document.getElementById('medium').matches(':focus')&&!document.getElementById('high').matches(':focus')&&!document.getElementById('lightThreshold').matches(':focus')&&!document.getElementById('timeout').matches(':focus')){
   document.getElementById('slow').value=d.slowThreshold;document.getElementById('medium').value=d.mediumThreshold;document.getElementById('high').value=d.highThreshold;document.getElementById('lightThreshold').value=d.lightThreshold;document.getElementById('timeout').value=d.timeoutSeconds;
  }
  document.getElementById('updated').textContent='Updated '+new Date().toLocaleTimeString();
 }catch(e){document.getElementById('updated').textContent='Connection lost';}
}
document.getElementById('lightAuto').addEventListener('click',async()=>{await request('/lightmode?value='+(document.getElementById('lightAuto').classList.contains('on')?'manual':'auto'));refresh()});
document.getElementById('ledOn').addEventListener('click',async()=>{await request('/led?value=on');refresh()});
document.getElementById('ledOff').addEventListener('click',async()=>{await request('/led?value=off');refresh()});
document.getElementById('fanAuto').addEventListener('click',async()=>{await request('/fan?value=auto');refresh()});
document.querySelectorAll('[data-fan]').forEach(b=>b.addEventListener('click',async()=>{await request('/fan?value='+b.dataset.fan);refresh()}));
document.getElementById('settingsForm').addEventListener('submit',async e=>{
 e.preventDefault();
 const p=new URLSearchParams({slow:document.getElementById('slow').value,medium:document.getElementById('medium').value,high:document.getElementById('high').value,lightThreshold:document.getElementById('lightThreshold').value,timeout:document.getElementById('timeout').value});
 try{const d=await (await request('/settings?'+p)).json();document.getElementById('settingsMsg').textContent=d.ok?'Settings applied':'Invalid values';document.getElementById('settingsMsg').style.color=d.ok?'#15966a':'#d64b5d';refresh()}catch(e){document.getElementById('settingsMsg').textContent='Request failed'}
});
refresh();setInterval(refresh,2000);
</script></body></html>
)HTML";

bool getFloatArg(const String& name, float& value) {
  if (!server.hasArg(name) || server.arg(name).length() == 0) return false;
  String raw = server.arg(name);
  char* endPtr = nullptr;
  value = strtof(raw.c_str(), &endPtr);
  return endPtr != raw.c_str() && *endPtr == '\0';
}

void handleRoot() {
  server.send_P(200, "text/html; charset=utf-8", DASHBOARD);
}

void handleApi() {
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
  server.sendHeader("Cache-Control", "no-store");
  server.send(200, "application/json", json);
}

void handleLightMode() {
  if (server.hasArg("value")) {
    String value = server.arg("value");
    if (value == "auto") autoLight = true;
    else if (value == "manual") {
      autoLight = false;
      manualLED = ledState;
    }
  }
  server.send(200, "text/plain", "OK");
}

void handleLED() {
  if (server.hasArg("value")) {
    String value = server.arg("value");
    autoLight = false;
    if (value == "on") manualLED = true;
    else if (value == "off") manualLED = false;
  }
  server.send(200, "text/plain", "OK");
}

void handleFan() {
  if (server.hasArg("value")) {
    String value = server.arg("value");
    if (value == "auto") manualFan = false;
    else if (value == "OFF" || value == "SLOW" || value == "MEDIUM" || value == "HIGH") {
      manualFan = true;
      manualFanMode = value;
    }
  }
  server.send(200, "text/plain", "OK");
}

void handleSettings() {
  float slow, medium, high, light, timeout;
  bool valid = getFloatArg("slow", slow) &&
               getFloatArg("medium", medium) &&
               getFloatArg("high", high) &&
               getFloatArg("lightThreshold", light) &&
               getFloatArg("timeout", timeout);
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

void updateSensorsAndOutputs() {
  unsigned long now = millis();
  rawMotion = digitalRead(PIR_PIN) == HIGH;
  if (rawMotion) lastMotionMs = now;
  occupied = (lastMotionMs != 0 && (now - lastMotionMs <= noMotionTimeoutMs));

  ldrValue = analogRead(LDR_PIN);
  darkRoom = DARK_WHEN_BELOW ? (ldrValue < lightThreshold) : (ldrValue > lightThreshold);

  if (lastDhtReadMs == 0 || now - lastDhtReadMs >= 2000UL) {
    lastDhtReadMs = now;
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (!isnan(t)) temperature = t;
    if (!isnan(h)) humidity = h;
  }

  ledState = autoLight ? (occupied && darkRoom) : manualLED;
  digitalWrite(LED_PIN, ledState ? HIGH : LOW);

  if (manualFan) fanMode = manualFanMode;
  else if (isnan(temperature) || temperature < slowThreshold) fanMode = "OFF";
  else if (temperature < mediumThreshold) fanMode = "SLOW";
  else if (temperature < highThreshold) fanMode = "MEDIUM";
  else fanMode = "HIGH";

  if (fanMode == "SLOW") fanPercent = 33;
  else if (fanMode == "MEDIUM") fanPercent = 66;
  else if (fanMode == "HIGH") fanPercent = 100;
  else fanPercent = 0;
}

void setup() {
  Serial.begin(115200);
  delay(150);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  dht.begin();

  WiFi.mode(WIFI_AP);
  bool apStarted = WiFi.softAP(AP_SSID, AP_PASSWORD);
  Serial.println();
  Serial.println(F("Smart Classroom Automation"));
  Serial.print(F("Access point: "));
  Serial.println(apStarted ? F("started") : F("FAILED"));
  Serial.print(F("Wi-Fi SSID: "));
  Serial.println(AP_SSID);
  Serial.print(F("Wi-Fi password: "));
  Serial.println(AP_PASSWORD);
  Serial.print(F("Dashboard: http://"));
  Serial.println(WiFi.softAPIP());

  server.on("/", HTTP_GET, handleRoot);
  server.on("/api", HTTP_GET, handleApi);
  server.on("/lightmode", HTTP_GET, handleLightMode);
  server.on("/led", HTTP_GET, handleLED);
  server.on("/fan", HTTP_GET, handleFan);
  server.on("/settings", HTTP_GET, handleSettings);
  server.begin();
  Serial.println(F("Web server started."));
}

void loop() {
  server.handleClient();
  updateSensorsAndOutputs();
  delay(10);
}
