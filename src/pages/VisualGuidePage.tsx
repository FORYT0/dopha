import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, X, Cpu, ZoomIn, ShoppingCart, ChevronRight,
  ArrowRight, Scan,
} from 'lucide-react';
import {
  Cpu as CpuIcon, Wifi, Camera, Monitor, Thermometer, Ruler, Eye, Flame, Wind, Sun,
  Droplets, Mic, Heart, Cloud, AlertTriangle, Waves, CloudRain, Scale,
  Palette, Hand, Zap, Battery, Sliders, SlidersHorizontal, Timer,
  ToggleLeft, ToggleRight, Grid3x3, Power, Volume2, GitBranch,
  BatteryCharging, Triangle, Clock, Grid2x2, ArrowRightLeft, ArrowUpRight,
  Cog, ArrowDownUp, Plug, Gauge, PenTool, ArrowDown, LayoutGrid, Cable,
  Scissors, Wrench, Square, Activity, Bluetooth, Radio, Smartphone,
  CreditCard, Globe, MapPin, RotateCw, Car, BatteryFull, Box, ArrowUp,
  Shield, Calculator, Binary, Lightbulb, CircleDot,
  type LucideIcon,
} from 'lucide-react';
import { useStaff, type EditableProduct } from '../context/StaffContext';
import { useCart } from '../context/CartContext';
import { categories } from '../data/products';

// ── Icon map ─────────────────────────────────────────────────────────────────
const iconMap: Record<string, LucideIcon> = {
  Cpu: CpuIcon, Wifi, Camera, Monitor, Thermometer, Ruler, Eye, Flame, Wind, Sun,
  Droplets, Mic, Heart, Cloud, AlertTriangle, Waves, CloudRain, Scale,
  Palette, Hand, Zap, Battery, Sliders, SlidersHorizontal, Timer,
  ToggleLeft, ToggleRight, Grid3x3, Power, Volume2, GitBranch,
  BatteryCharging, Triangle, Clock, Grid2x2, ArrowRightLeft, ArrowUpRight,
  Cog, ArrowDownUp, Plug, Gauge, PenTool, ArrowDown, LayoutGrid, Cable,
  Scissors, Wrench, Square, Activity, Bluetooth, Radio, Smartphone,
  CreditCard, Globe, MapPin, RotateCw, Car, BatteryFull, Box, ArrowUp,
  Shield, Calculator, Binary, Lightbulb, CircleDot, ArrowRight, Scan,
  Waveform: Activity, Grab: Hand, Container: Box,
};

// ── Identification tips database ─────────────────────────────────────────────
interface ComponentTip {
  look: string;
  package: string;
  leads: string;
  uses: string[];
  tip?: string;
}

const DEFAULT_TIP: ComponentTip = {
  look: 'Refer to the product description and datasheet for physical identification details.',
  package: 'Electronic component',
  leads: 'See datasheet',
  uses: ['Electronics projects', 'Engineering courses', 'Prototyping'],
};

// Keys: "category/subcategory" (composite) or "subcategory" (simple)
const TIPS: Record<string, ComponentTip> = {
  // Microcontrollers
  arduino: {
    look: 'Rectangular green or blue PCB with a USB port on one end, a power barrel jack on the other, and two rows of female pin headers along both long edges. The large 28-pin DIP ATmega chip sits near the center. Look for a small crystal (silver metallic can) and a reset button near one end.',
    package: 'Through-hole PCB module',
    leads: 'Uno: 14 digital I/O (6 PWM), 6 analog (A0-A5), VIN, 5V, 3.3V, GND, RESET. Nano: same but narrower form factor.',
    uses: ['LED and motor control', 'Sensor interfacing', 'Student lab projects', 'Rapid prototyping'],
    tip: 'Arduino Uno has a square USB-B port (like a printer cable). Arduino Nano has a Mini-USB or Micro-USB port and is roughly half the width — designed to plug directly into a breadboard.',
  },
  esp: {
    look: 'A compact module with a distinctive shiny metal RF shielding can soldered flat on the top surface. This metal can is the most recognizable feature. Most DevKit boards add header pins along two long edges and have a micro-USB port for programming.',
    package: 'SMD RF module / DevKit PCB',
    leads: '3.3V, GND, multiple GPIO, TX/RX, EN, ADC (analog in), BOOT/FLASH pin',
    uses: ['WiFi IoT projects', 'Home automation', 'Wireless sensor nodes', 'Web servers'],
    tip: 'ESP32 has a dual-core CPU, Bluetooth, and more GPIO pins than ESP8266. ESP8266 is single-core WiFi only. Both are identified by the metal RF shielding can — without it they would not pass RF certification.',
  },
  rpi: {
    look: 'Raspberry Pi Pico: Very small (21x51 mm) green or white PCB with a USB Micro-B port and distinctive castellated (scalloped) half-circle holes along all four edges for SMD mounting. Pi 4: Larger credit-card sized board with HDMI mini ports, USB-A ports, Ethernet, and a 40-pin GPIO header.',
    package: 'PCB module',
    leads: 'Pico: 26 multi-function GPIO, SPI, I2C, UART, PWM, ADC. Pi 4: 40-pin GPIO header with power rails.',
    uses: ['MicroPython scripting (Pico)', 'Linux-based projects (Pi 4)', 'IoT gateways', 'Computer vision (Pi 4)'],
    tip: 'The Pico W adds WiFi to the Pico. The castellated edge holes (small half-circle cutouts) are the key identifier — no other Arduino-class board uses them. The RP2040 chip in the center is the square black IC.',
  },
  stm: {
    look: 'Long narrow blue PCB (~23x53 mm) nicknamed the "Blue Pill". An STM32 ARM chip sits near the center. A small crystal, two boot-mode jumpers (BOOT0/BOOT1), and a mini-USB port are visible. Debug pins (SWD: SWCLK, SWDIO) run along one short edge.',
    package: 'PCB module (DIP-40 style)',
    leads: '32 GPIO pins split between port A and port B, 3.3V, GND, NRST, BOOT0/1, SWD debug',
    uses: ['ARM embedded learning', 'High-speed PWM/timers', 'USB peripheral projects', 'Signal processing'],
    tip: 'The blue PCB color and narrow form factor are the defining features. Unlike Arduino boards, STM32 requires a programmer (ST-Link or USB-serial bootloader) and a toolchain like STM32CubeIDE or PlatformIO.',
  },
  kits: {
    look: 'A retail box or sealed bag containing multiple components — typically an Arduino or ESP board, a breadboard, jumper wires, LEDs, resistors, push buttons, and a project guide booklet.',
    package: 'Bundled kit (multiple components)',
    leads: 'Varies by kit; individual components inside follow their own pin descriptions',
    uses: ['Getting started with electronics', 'School lab work', 'Learning programming with hardware', 'Gift kits for beginners'],
    tip: 'Kits are great value but check the component list before ordering — some kits omit a USB cable or certain sensors. The included project guide tells you what projects can be built with the kit.',
  },

  // Sensors
  environmental: {
    look: 'Small rectangular PCB module (roughly 15x27 mm). DHT11/22 sensors have a distinctive rectangular blue or white plastic sensor housing with a mesh vent at the front. The module has 3 or 4 pins and sometimes a small decoupling capacitor and pull-up resistor already soldered on.',
    package: '3-pin or 4-pin PCB module',
    leads: 'VCC (3.3-5V), Data/Signal, GND, (NC on 4-pin versions)',
    uses: ['Weather stations', 'Greenhouses and agriculture', 'HVAC monitoring', 'Indoor climate displays'],
    tip: 'DHT22 has higher accuracy (±0.5C, ±2% RH) and wider range than DHT11 (±2C, ±5% RH). Both look very similar — the DHT22 sensor body is slightly larger. Always check the module label before buying.',
  },
  distance: {
    look: 'A small rectangular PCB (~45x20 mm) with two round silver ultrasonic transducers (one marked TRIG, one ECHO) facing forward. They look like two silver "robot eyes." Usually white or light blue, with 4-pin header at the back.',
    package: '4-pin module (VCC, TRIG, ECHO, GND)',
    leads: 'VCC (5V), TRIG (input), ECHO (output), GND',
    uses: ['Distance measurement 2-400 cm', 'Obstacle detection for robots', 'Parking sensors', 'Liquid level detection'],
    tip: 'The two round silver cylinders are the key identifier: one transmits, one receives 40 kHz ultrasound pulses. TRIG gets a 10 µs HIGH pulse to fire; ECHO goes HIGH for a duration proportional to distance.',
  },
  motion: {
    look: 'A white dome-shaped Fresnel lens (resembles a small igloo or eye) mounted on a circular PCB. Underneath the dome are the actual pyroelectric sensor elements. On the back PCB, two orange or blue trimmer potentiometers adjust sensitivity and delay time. There is often an LED status indicator.',
    package: 'Dome-shaped 3-pin module',
    leads: 'VCC (5V), OUT (digital), GND',
    uses: ['Security/intruder alarms', 'Automatic corridor lights', 'People counters', 'Energy-saving switches'],
    tip: 'The white dome is a Fresnel lens that focuses infrared radiation. It detects heat differences caused by a moving warm body (human or animal) — not motion per se. The two trimpots set (1) detection range and (2) how long the output stays HIGH after detection.',
  },
  gas: {
    look: 'A rectangular PCB module with a small cylindrical metal mesh sensor can elevated above the board surface. The mesh can contains a heated sensing element. On the PCB: an LM393 comparator IC, a blue trimmer pot, two indicator LEDs (power and threshold), and a 4-pin header.',
    package: '4-pin PCB module with cylindrical sensor element',
    leads: 'VCC (5V), GND, DO (digital threshold output), AO (analog voltage output)',
    uses: ['Gas leak alarms', 'Air quality monitoring', 'Smoke detectors', 'Industrial safety systems'],
    tip: 'The metallic mesh cylinder HEATS UP during operation — do not touch it. MQ-2 detects smoke, LPG, propane, hydrogen. MQ-135 detects CO2, NH3, benzene, and general air quality. Allow 2 minutes warm-up time before readings stabilize.',
  },
  light: {
    look: 'A small rectangular PCB with an LDR (light-dependent resistor) — the LDR component itself looks like a small disc or puck with a zigzag or serpentine carbon track visible inside a clear epoxy dome. The module usually includes a trimmer pot for threshold adjustment and an LM393 comparator.',
    package: '3-pin or 4-pin PCB module',
    leads: 'VCC, DO (digital output), AO (analog output), GND',
    uses: ['Day/night automatic switches', 'Solar trackers', 'Light intensity logging', 'Automatic blinds or curtains'],
    tip: 'LDR resistance is HIGH in darkness (~1 MΩ) and LOW in bright light (~1 kΩ). Use in a voltage divider: the junction voltage changes with light. The module already has this divider built in.',
  },
  line: {
    look: 'A small PCB with an infrared (IR) LED and a phototransistor side by side, pointing downward toward the ground surface. The LEDs are usually dark-tinted (invisible IR light). A trimmer pot adjusts detection sensitivity. Often used in arrays of 3 or 5 for full line sensing.',
    package: '3-pin module (VCC, OUT, GND)',
    leads: 'VCC (5V or 3.3V), OUT (digital), GND',
    uses: ['Line-following robots', 'Optical encoder discs', 'Edge detection', 'White-line detection'],
    tip: 'Mount the sensor 15-25 mm above the surface. White surfaces reflect IR strongly (output goes LOW); black surfaces absorb IR (output HIGH). Adjust the trimmer until only the line causes a state change.',
  },
  'sensors/audio': {
    look: 'Sound sensor: Small rectangular PCB (~36x15 mm) with a small silver electret microphone capsule (a tiny cylinder with holes) and an LM393 comparator. Piezo buzzer: Round cylindrical can (~12 mm diameter) with a + marking on top and two leads.',
    package: '3-pin or 4-pin PCB module (sensor); 2-pin component (buzzer)',
    leads: 'Sound sensor: VCC, GND, DO (digital), AO (analog)',
    uses: ['Clap-activated switches', 'Sound level monitors', 'Voice-activated projects', 'Noise alarms'],
    tip: 'Active buzzers make sound from DC power alone. Passive buzzers need a PWM (tone) signal. Active buzzers have a small circuit board visible inside if you remove the plastic cap.',
  },
  medical: {
    look: 'Small circular PCB (~14 mm diameter) with a bright green or red LED and a photodetector on the sensing face. Designed to clip onto a fingertip. Typically connected by a 1-meter cable to an Arduino-compatible connector.',
    package: 'Circular finger-clip sensor with cable',
    leads: 'VCC (3.3-5V), Signal (analog), GND',
    uses: ['Heart rate monitors', 'Pulse measurement', 'Biometric health gadgets', 'Wearable projects'],
    tip: 'The LED flashes at high frequency (invisible to the eye at normal viewing). Press the sensor firmly over a blood vessel on the fingertip (not the nail side). Use the provided signal-processing library to extract the pulse waveform from the noisy analog output.',
  },
  level: {
    look: 'A rectangular PCB (~65x20 mm) with parallel exposed copper trace "fingers" covering most of one side. These bare copper traces are the sensing element — water bridges them to change resistance. A control PCB with an LM393 comparator is also included.',
    package: '3-pin or 4-pin module (PCB with traces)',
    leads: 'VCC, Signal/AO, GND',
    uses: ['Water tank level monitoring', 'Flood/overflow alarms', 'Aquarium water level', 'Irrigation trigger'],
    tip: 'Immerse ONLY the trace section — keep the electronics portion above the waterline. Copper traces corrode over time in water. After experiments, rinse and dry the sensor, or apply conformal coating for longer life.',
  },
  weather: {
    look: 'A two-board set: a sensing pad (mesh or comb pattern of copper traces on a ~70x30 mm PCB) and a smaller control board with LM393 comparator and trimpot. Rain droplets bridge the traces on the sensing pad, changing resistance.',
    package: '2-board module (sensing pad + control board)',
    leads: 'VCC, GND, DO, AO',
    uses: ['Rain alarms', 'Automated irrigation systems', 'Smart window openers', 'Weather station triggers'],
    tip: 'Clean the sensing pad regularly — mineral deposits from tap water can cause false positives. Use distilled water or apply a hydrophobic coating after calibration.',
  },
  weight: {
    look: 'Load cell: A flat metal bar (aluminum or steel, ~80 mm long) with a small strain gauge element bonded to the center and 4 color-coded wires. HX711 module: A small red PCB (~38x21 mm) with the HX711 24-bit ADC chip and 4-pin Arduino header.',
    package: 'Load cell bar + HX711 ADC module',
    leads: 'HX711: VCC, GND, DT (serial data), SCK (serial clock)',
    uses: ['Digital weighing scales', 'Force measurement jigs', 'Mail weighers', 'Load monitoring systems'],
    tip: 'Connect: load cell red to E+, black to E−, white to A+, green to A−. Power HX711 at 3.3V or 5V. Use the HX711 Arduino library. Calibrate with a known reference weight before first use.',
  },
  color: {
    look: 'A small square PCB (~30x30 mm) with a ring of white LEDs around the edges and a TCS3200 photodiode array in the center. The sensor chip has a clear window facing the object. Usually has an 8-pin header.',
    package: 'Square PCB module with LED ring',
    leads: 'VCC (5V), GND, S0, S1 (frequency scaling), S2, S3 (filter select), OUT (frequency output), OE (enable)',
    uses: ['Color sorting robots', 'Paint color matching', 'Object identification by color', 'Spectroscopy demos'],
    tip: 'Hold the sensor 5-10 mm from the object surface for best readings. The white LEDs illuminate the object; the photodiodes read reflected light through RGB color filters. The output is a frequency — higher = more of that color.',
  },
  bend: {
    look: 'A long, thin (approximately 56 mm x 6 mm) flat flexible strip with a carbon-coated polymer on one side and two metal leads at one end. Looks like a flat plastic ruler segment. The carbon coating is on the outer convex side when bending.',
    package: 'Flexible polymer strip (2 leads)',
    leads: '2 leads — no polarity',
    uses: ['Gesture-control gloves', 'Robotic finger angle sensing', 'Bend/flex musical controllers', 'Prosthetic hand feedback'],
    tip: 'Flat resistance: ~10 kΩ. At maximum 90-degree bend: ~30-35 kΩ. Use in a voltage divider with a fixed resistor. Bend the carbon-coated side outward (convex) for best dynamic range. Avoid creasing — sharp folds permanently damage the sensor.',
  },

  // Passive Components
  resistors: {
    look: 'Small axial-lead cylindrical body (typically 2-5 mm long) with colored bands around the middle and two wire leads extending from each end. The body is usually beige/tan (carbon film) or light blue (metal film). 4 bands = 5% tolerance, 5 bands = 1% tolerance.',
    package: 'Axial through-hole (DIP-2)',
    leads: '2 leads, no polarity — can be inserted either way',
    uses: ['LED current limiting', 'Pull-up/pull-down for logic pins', 'Voltage dividers', 'RC timing circuits'],
    tip: 'Read color bands left-to-right with the tolerance band (gold/silver) on the right. First two bands = digits, third = multiplier, fourth = tolerance. Trick: BBROY Great Britain Very Good Wife Silver Gold → Black(0) Brown(1) Red(2) Orange(3) Yellow(4) Green(5) Blue(6) Violet(7) Grey(8) White(9).',
  },
  capacitors: {
    look: 'Electrolytic: Aluminum cylinder with a negative (−) polarity stripe down one side, a vented or scored top, and a longer positive lead. Ceramic: Small round disc or rectangular wafer, usually yellow, tan, or brown, with no polarity markings — much smaller than electrolytics.',
    package: 'Radial through-hole (electrolytic) or disc through-hole (ceramic)',
    leads: 'Electrolytic: longer lead = (+) anode. Ceramic: no polarity.',
    uses: ['Power supply smoothing', 'Bypass/decoupling for ICs', 'RC timing circuits', 'Coupling/blocking in audio'],
    tip: 'NEVER reverse-connect an electrolytic capacitor — overpressure can make it bulge or rupture. The capacitance value on ceramics is often a 3-digit code: "104" means 10 followed by 4 zeros of picofarads = 100,000 pF = 100 nF = 0.1 µF.',
  },
  potentiometers: {
    look: 'A round rotary knob on a rectangular body with three legs (for rotary type) or a sliding handle with three legs (slider). Turning the shaft changes resistance between the center wiper pin and either outer pin. The body is usually black or blue plastic.',
    package: 'Through-hole rotary (3-pin)',
    leads: 'Pin 1 (left end), Pin 2 (wiper/center — output), Pin 3 (right end)',
    uses: ['Volume and tone controls', 'Brightness adjustment', 'Analog joystick position', 'Servo calibration'],
    tip: 'Connect outer pins to VCC and GND; the center (wiper) pin gives a variable voltage from 0V to VCC depending on rotation. This is a classic voltage divider. B10K means a linear taper 10 kΩ potentiometer.',
  },
  inductors: {
    look: 'Small cylindrical or disc-shaped coil. Power inductors look similar to resistors but with fewer/no colored bands and a heavier gauge wire. Wire-wound types show a visible coil of wire around a toroidal (donut) or cylindrical ferrite core.',
    package: 'Axial or radial through-hole',
    leads: '2 leads — no polarity',
    uses: ['Buck/boost converter chokes', 'Power supply filters', 'RF tank circuits', 'EMI suppression'],
    tip: 'Inductors resist rapid changes in current (opposite of capacitors, which resist voltage changes). In DC-DC converters they temporarily store energy in a magnetic field. Value is measured in microhenries (µH) or millihenries (mH).',
  },
  crystals: {
    look: 'A small silver metallic can (HC-49S: flat oval canister ~11x5 mm) or a tiny ceramic SMD package. Two wire leads exit from the bottom. They look like a miniature metal flask. Sometimes used in ceramic resonator packages (3-pin) that look like a small plastic rectangle.',
    package: 'HC-49S through-hole or SMD',
    leads: '2 leads — no polarity',
    uses: ['MCU clock source', 'Real-time clock (RTC) circuits', 'Baud rate accuracy for UART', 'Frequency references'],
    tip: 'Crystals need two load capacitors (typically 22 pF) connected from each lead to ground to form a pierce oscillator. Without load caps, the crystal may not start oscillating reliably. The frequency is printed on the can: e.g., "16.000" means 16 MHz.',
  },
  switches: {
    look: 'Tactile button: Tiny ~6x6 mm square plastic body with 4 legs (internally two pairs of shorted legs). Pressing the top actuator connects the two internal pairs. Slide switch: A small rectangular body with a sliding actuator that moves left/right. DIP switch: A row of miniature switches in a single package.',
    package: 'Through-hole (4-pin for tactile, 3-pin for slide)',
    leads: 'Tactile: 4 pins, internally paired (diagonally opposite pins are connected pre-press)',
    uses: ['Reset buttons', 'Mode selection', 'User input interfaces', 'Power on/off switches'],
    tip: 'A tactile button has 4 legs but only 2 distinct electrical connections. Legs on the same short side are already connected together. Pressing bridges the two short-side pairs. When mounting, orient the button so legs face the breadboard rails for proper breadboard fit.',
  },
  relays: {
    look: 'A rectangular blue or black coil housing (the relay itself) soldered onto a green or blue PCB. The PCB includes an optocoupler, transistor driver, 5V indicator LED, and screw terminals (COM, NO, NC) or pins for the switched load. A normally-open or closed circuit is controlled by energizing the coil.',
    package: 'PCB module with relay coil',
    leads: 'Control side: IN (signal), VCC (5V), GND. Load side: COM (common), NO (normally open), NC (normally closed)',
    uses: ['Controlling 230V AC appliances', 'High-current DC motor switching', 'Home automation', 'Solenoid valves'],
    tip: 'Most relay modules are active LOW — the relay triggers when IN is pulled LOW (not HIGH). Connect: load wire to COM and NO; the circuit completes when relay activates. NEVER connect AC mains to the same breadboard as the Arduino side.',
  },
  'passive/audio': {
    look: 'Active piezo buzzer: Round black cylinder (~12 mm diameter) with a + marking on top. Has 2 pin leads underneath. Passive piezo buzzer looks identical but makes no sound on DC power alone. Speaker: Circular with a paper or mylar cone and magnet basket, with 2 wire leads.',
    package: '2-lead through-hole component',
    leads: '+ (positive/longer lead) and − (negative/shorter lead)',
    uses: ['Alert tones and alarms', 'Melody playback (passive)', 'Button click feedback', 'Arduino tone() experiments'],
    tip: 'Trick to tell active from passive: connect directly to 5V and GND. Active buzzer makes a fixed tone immediately. Passive buzzer stays silent — it needs a PWM frequency signal via Arduino tone().',
  },
  smd: {
    look: 'Extremely tiny flat surface-mount components on tape reels or in labeled grid trays. 0402 chips are 1.0x0.5 mm (barely visible!), 0805 chips are 2.0x1.25 mm (rice-grain sized). No leads — two metallic end caps for soldering to PCB pads.',
    package: 'SMD 0402 / 0603 / 0805',
    leads: 'Surface-mount pads (no through-hole leads)',
    uses: ['Commercial PCB design', 'Compact circuit layouts', 'SMD soldering practice', 'Production-grade prototypes'],
    tip: 'Work over a white sheet of paper — SMD components are tiny and launch across the room when tweezers slip. Use a magnifying glass or USB microscope. A hot air rework station makes SMD soldering much easier than an iron alone.',
  },

  // Active Components
  transistors: {
    look: 'BJT (BC547/BC557/2N2222): A small black D-shaped (flat on one side, curved on the other) TO-92 plastic body with 3 flat metal legs. MOSFET (IRFZ44N): Larger TO-220 package with a flat black body, metal tab with a hole at top for heatsinking, and 3 legs.',
    package: 'TO-92 (small BJT) or TO-220 (power MOSFET/BJT)',
    leads: 'BJT TO-92 (face flat side): E – B – C left to right. MOSFET TO-220 (face label): G – D – S left to right.',
    uses: ['Switching LEDs or relays from MCU pins', 'Signal amplifiers', 'Logic level inverters', 'Motor drivers'],
    tip: 'NPN (BC547): base HIGH turns transistor ON (collector to emitter current flows). PNP (BC557): base LOW turns it ON. MOSFETs need a gate voltage above threshold (~2-4V) for N-channel types. Always check the datasheet pinout — TO-92 pinouts vary by manufacturer.',
  },
  diodes: {
    look: 'A small glass (1N4148) or black plastic (1N4007) cylinder, 3-5 mm long, with a single silver or white band painted at one end. Two axial wire leads extend from each end. The band marks the cathode (negative) end.',
    package: 'DO-35 glass (signal) or DO-41 plastic (rectifier)',
    leads: 'Anode (no band, positive) → Cathode (white/silver band, negative). Current flows anode to cathode only.',
    uses: ['Flyback/reverse-EMF protection', 'Half-wave and full-wave rectification', 'Signal clamping and clipping', 'Reverse polarity protection'],
    tip: 'Memory trick: the band on the cathode looks like the flat bar in the diode symbol (triangle pointing at a bar). 1N4148 is a fast signal diode (75V, 300 mA). 1N4007 is a power rectifier (1000V, 1A) — physically larger and slower.',
  },
  regulators: {
    look: 'LM7805 (5V fixed): TO-220 package — a black rectangular body with a flat metal tab at the top with a mounting hole. Three legs labeled IN, GND, OUT (left to right when label faces you). LM317 (adjustable): Similar TO-220 shape but different pin order. LM2596 (switching): Already soldered on a blue PCB module with an inductor and capacitors.',
    package: 'TO-220 (linear) or PCB module (switching)',
    leads: 'LM7805: IN – GND – OUT. LM317: ADJ – OUT – IN (different order!). LM2596 module: IN+/−, OUT+/−.',
    uses: ['Powering 5V circuits from 9-12V', 'Stable reference voltages', 'Custom adjustable power supplies', 'Battery elimination circuits'],
    tip: 'LM7805 drops at least 2V across itself as heat — powering from 9V means 4V wasted as heat. Add a heatsink for currents above 500 mA. LM2596 (switching regulator) is far more efficient (up to 92%) but costs more and needs LC filtering (already on the module).',
  },
  ics: {
    look: 'Black rectangular DIP (Dual In-line Package) body with two parallel rows of metal pins. DIP-8 has 8 pins (4 per side), DIP-14 has 14, DIP-16 has 16. A semicircular notch at one end marks pin 1 orientation. Some have a small round dimple or dot above pin 1.',
    package: 'DIP-8 / DIP-14 / DIP-16 through-hole',
    leads: 'Pin 1 is adjacent to the notch/dot. Pins number counter-clockwise when viewed from top (notch at top-left).',
    uses: ['Op-amp circuits (LM358/LM324)', 'Timers and PWM (NE555)', 'Logic functions (74HC series)', 'Serial shift register expansion (74HC595)'],
    tip: 'ALWAYS confirm orientation before powering — backwards voltage kills most ICs instantly. Insert the notch to match the silkscreen outline on the PCB. In a breadboard, DIP ICs straddle the center gap with pins in opposite rails.',
  },

  // Power
  adapters: {
    look: 'A plastic wall plug with a wire ending in a barrel jack connector (usually 5.5x2.1 mm outer/inner diameter). The cable is typically ~1.2-1.5 m long. The label on the adapter states the output voltage and current (e.g., "OUTPUT: 5V -- 2A").',
    package: 'AC-DC wall adapter',
    leads: 'Barrel jack: center pin = (+) positive, outer ring = (−) negative (almost universally)',
    uses: ['Arduino and breadboard power', 'LED strip power supplies', 'Motor controllers', 'Lab bench supply'],
    tip: 'Confirm polarity on the label before connecting — look for the ⊕→⊖ symbol showing center-positive. Using the wrong voltage destroys boards instantly. Prefer adapters rated 20-50% above your actual current draw for stability.',
  },
  batteries: {
    look: '18650 cell: Cylindrical, ~65 mm long x 18 mm diameter (similar to a fat AA battery). Has a flat negative (−) end and a slightly raised positive (+) button. 9V: Rectangular block ~48x26 mm with two snap connectors on top.',
    package: 'Cylindrical cell (18650) or rectangular (9V)',
    leads: '18650: flat bottom = (−), raised button top = (+). 9V: snap terminals (positive = smaller stud, negative = larger ring).',
    uses: ['Portable robot power', 'Backup power for IoT nodes', 'Rechargeable project power', 'Multimeter power'],
    tip: '18650 cells need a protection circuit to prevent dangerous overcharge/over-discharge. A green dot or "PCB" label on the positive end indicates a protected cell. Unprotected cells are slightly shorter and cheaper but must be used with a BMS circuit.',
  },
  'power/modules': {
    look: 'Breadboard PSU: A small PCB (~53x22 mm) designed to straddle the top of a standard breadboard. Has USB and barrel jack inputs and switchable 3.3V/5V output rails. TP4056 charger: A tiny red or blue PCB (~25x17 mm) with a micro-USB input port and two indicator LEDs (red=charging, blue/green=full).',
    package: 'PCB module',
    leads: 'Breadboard PSU: plugs into breadboard power rails. TP4056: B+ and B− (battery), OUT+ and OUT−.',
    uses: ['Li-Ion charging (TP4056)', 'Dual 3.3V/5V breadboard power', 'Portable battery charge circuits', 'LiPo cell management'],
    tip: 'TP4056 charges at up to 1A by default (set by a resistor on the PCB). Blue LED = fully charged. The protection version of the module (TP4056+DW01) adds overdischarge and short-circuit protection — always use the protected version.',
  },
  solar: {
    look: 'A flat rigid panel with a dark blue or black polycrystalline or monocrystalline cell surface. Small panels (1W) are about the size of a playing card. Has two wire leads (red=+, black=−) or a JST connector.',
    package: 'Rigid glass/plastic solar panel',
    leads: 'Red = positive (+), Black = negative (−)',
    uses: ['Solar energy harvesting experiments', 'Outdoor IoT self-powered nodes', 'Solar tracker projects', 'Battery trickle charging'],
    tip: 'Solar panel output voltage varies with light intensity. Always use a MPPT or PWM charge controller between the panel and a battery — direct connection can overcharge and damage the battery. Output current is proportional to panel area and light intensity.',
  },
  banks: {
    look: 'A rectangular portable device slightly larger than a smartphone, with one or two USB-A output ports, a micro-USB or USB-C charging input, and an LED bar or display showing remaining charge percentage.',
    package: 'Portable power bank',
    leads: 'USB-A output (5V standard)',
    uses: ['Powering Raspberry Pi in the field', 'Portable ESP32/Arduino projects', 'Overnight IoT deployments', 'Field testing electronics'],
    tip: 'Some power banks auto-shut off when current draw is very low (like a sleeping ESP32). For MCU projects that enter deep sleep, choose a power bank with an "always-on" or "small device charging" mode. A constant 100 mA draw usually prevents auto-shutoff.',
  },
  'power/connectors': {
    look: 'Barrel jack adapter: A cylindrical metal socket (~11 mm long) with a center hole for the inner barrel. Screw terminals on the PCB board version. 9V snap: A red/black two-wire clip that snaps onto the top terminals of a 9V battery.',
    package: 'Panel-mount or PCB connector',
    leads: 'Barrel: center = +, outer = −. 9V snap: red = +, black = −.',
    uses: ['Connecting power adapters to breadboard circuits', 'Battery connections in project enclosures', 'Quick-disconnect power inputs', 'Custom power supply outputs'],
  },

  // Tools
  meters: {
    look: 'A handheld yellow, black, or red plastic enclosure with a large rotary selector dial in the center (typically 12 positions), LCD display at top, and 3-4 circular probe insertion ports at the bottom (COM, VΩmA, 10A).',
    package: 'Handheld digital instrument',
    leads: 'COM (black probe, all measurements), VΩmA (red, most measurements), 10A (red, high current only)',
    uses: ['DC/AC voltage measurement', 'Resistance and continuity testing', 'Diode and transistor testing', 'Capacitance (auto-ranging models)'],
    tip: 'START on the highest range when unknown — drop down for better resolution. For continuity testing, set dial to the beep/diode symbol. Always remove probes from circuit before switching measurement type (e.g., current to voltage) to avoid blowing the internal fuse.',
  },
  soldering: {
    look: 'Soldering iron: A cylindrical pen-shaped tool with a heat-resistant rubber grip, a thin metal barrel, and a replaceable metallic tip at the front. When hot, the tip glows and any solder left on it burns. Solder wire: Shiny silver metallic wire coiled on a blue or black plastic reel.',
    package: 'Iron + wire + accessories',
    leads: 'N/A — 220V mains powered',
    uses: ['Soldering through-hole components to PCB', 'Repairing broken PCB joints', 'Tinning and joining wires', 'Desoldering and rework'],
    tip: 'Tin (pre-coat with solder) the tip before each session and wipe on a wet sponge or brass wool. A shiny silver tip transfers heat well; a black oxidized tip transfers heat poorly. Heat the joint (pad + component leg), not the solder wire directly.',
  },
  breadboards: {
    look: 'A white or cream-colored rectangular plastic board (~170x65 mm for half-size, ~165x55 mm for mini) with a grid of tiny holes on a 0.1" (2.54 mm) pitch. Colored strips along each long edge are power rails (usually red=+, blue=−). The center gap divides the board for DIP IC mounting.',
    package: 'Solderless PCB',
    leads: 'Each row of 5 holes on either side of the center gap is internally connected. Power rails run the full length of the board.',
    uses: ['Circuit prototyping', 'Quick student experiments', 'Testing before soldering', 'Temporary wiring assemblies'],
    tip: 'The center gap is deliberately sized to straddle DIP IC chips — each row of 5 holes on opposite sides of a DIP pin is isolated. Power rails do NOT automatically connect across the center gap — use a jumper wire to connect top and bottom rail sections.',
  },
  wires: {
    look: 'Flexible color-coded insulated wires (22-26 AWG) with small plastic 2.54 mm Dupont connectors on each end. Male connectors have a metal pin sticking out; female connectors have a hole. Typically sold in rainbow sets (10 colors x 10 wires each). Length usually 20-30 cm.',
    package: 'Dupont 2.54 mm pitch connectors',
    leads: 'Male (M) connector: pin protrudes. Female (F) connector: socket hole. Color is for identification only — no electrical meaning.',
    uses: ['Breadboard to Arduino wiring', 'Module to module connections', 'Sensor interfacing', 'Quick prototyping'],
    tip: 'M-M: breadboard to breadboard. M-F: Arduino header pin to breadboard hole. F-F: module header to Arduino/ESP header. Buy extras — they break at the crimp joint after heavy use.',
  },
  'hand-tools': {
    look: 'Wire stripper: Plier-shaped tool with V-notched cutting edges and spring-loaded handles. Each notch is sized for a specific AWG gauge. Screwdriver set: Set of interchangeable bits in a handle with a magnetic tip. Precision sets include Philips, flathead, Torx, and hex (hex driver) bits.',
    package: 'Hand tools',
    leads: 'N/A',
    uses: ['Stripping insulation from wire', 'PCB assembly with screws', 'Electronics repair', 'Project enclosure assembly'],
    tip: 'Use the correct wire gauge notch when stripping — too small cuts the conductor, too large leaves insulation on. For solid-core breadboard wire, use a utility knife and finger-roll method to avoid nicking the conductor.',
  },
  pcb: {
    look: 'A flat rigid FR4 (glass epoxy) board, typically green or brown. Single-sided copper-clad boards show bare copper on one face. Prototype perf boards have a regular grid of plated through-holes (usually 1 mm, 2.54 mm pitch) for easy soldering.',
    package: 'FR4 PCB board',
    leads: 'Drilled holes on 2.54 mm pitch grid',
    uses: ['Making permanent versions of breadboard circuits', 'Custom PCB layouts', 'Soldering practice', 'Shield/adapter boards'],
    tip: 'Mark your layout on the non-copper side with a Sharpie marker. The copper side faces down (solder side). Use a hacksaw or PCB scribing tool to cut to size. For custom etched PCBs, use ferric chloride etchant with proper safety gear.',
  },
  'tools/test': {
    look: 'Logic analyzer: Small rectangular USB device (~5x2 cm) with a row of colored test clips on a ribbon cable. Oscilloscope kit (DSO138): PCB with a 2.4" TFT display, knobs, and BNC input. Function generator module: PCB with DDS chip, small OLED or 7-seg display, and SMA connector output.',
    package: 'PCB instrument / USB device',
    leads: 'Logic analyzer: test clips to signal pins. Oscilloscope: BNC probe. Function gen: SMA output.',
    uses: ['Debugging I2C/SPI/UART protocols', 'Visualizing PWM waveforms', 'Measuring signal frequency and timing', 'Generating test signals'],
    tip: 'A logic analyzer is the most useful debugging tool for Arduino/ESP projects after a multimeter. It can decode I2C, SPI, UART, and PWM in real time and show timing diagrams in free software like PulseView (sigrok).',
  },
  safety: {
    look: 'ESD wrist strap: An elastic wrist band with a metal snap and a coiled 1-2 m cable ending in an alligator clip. The clip connects to an earth ground point (e.g., PC chassis, ground terminal, or grounding wrist strap mat).',
    package: 'Wrist strap + grounding cable',
    leads: 'Ground clip',
    uses: ['Handling MOSFETs and CMOS ICs', 'PCB assembly work', 'Computer component handling', 'Preventing static discharge damage'],
    tip: 'A single static discharge (ESD) can permanently damage a MOSFET gate or CMOS IC without any visible evidence. MOSFETs and modern microcontrollers are especially vulnerable. Always wear the strap and clip it to a true earth ground, not just a plastic case.',
  },
  storage: {
    look: 'A hinged-lid transparent plastic box divided into multiple compartments by removable dividers. Usually 24, 36, or 48 cells. Stackable design. Components are visible through the lid.',
    package: 'Plastic organizer box',
    leads: 'N/A',
    uses: ['Sorting resistors by value', 'Organizing components for lab kits', 'Mobile component carry-case', 'Inventory management'],
  },
  accessories: {
    look: 'A small pocket-sized plastic card or wheel printed with resistor color code reference chart. Usually credit-card sized with rotating disc wheel or folded card format.',
    package: 'Pocket reference tool',
    leads: 'N/A',
    uses: ['Reading resistor color codes in the lab', 'Quick reference for students', 'Teaching tool', 'Gift for electronics students'],
  },
  'tools/power-supplies': {
    look: 'A small desktop unit (~200x150x100 mm) with a large dial-based or digital panel showing output voltage and current. Has red and black banana jack outputs on the front, coarse/fine adjustment knobs, and an ON/OFF switch. Typically styled in blue or grey.',
    package: 'Lab bench instrument',
    leads: 'Red = V+, Black = GND/V−',
    uses: ['Powering circuits at any voltage 0-30V', 'Current-limited power for debugging', 'Battery charging experiments', 'Characterizing component I-V curves'],
    tip: 'Always set current limit BEFORE connecting the circuit — this prevents accidental overcurrent from destroying components. For a fresh circuit, start at a low voltage and raise slowly while watching current draw.',
  },

  // Cables & Connectors
  usb: {
    look: 'USB-A to B: Rectangular USB-A plug and square USB-B plug (like a printer cable). USB-C: Small oval reversible connector — identical from both sides. Micro-USB: Small rectangular trapezoid connector (wider at top, narrower at bottom).',
    package: 'Cable with molded connectors',
    leads: 'VCC, D−, D+, GND, (shield)',
    uses: ['Programming Arduino/ESP boards', 'Raspberry Pi power', 'Serial data communication', 'Fast charging'],
    tip: 'USB-C is reversible and supports higher power delivery. Micro-USB has a small notch — insert gently. USB Type-B (square) is the standard Arduino Uno programming cable. Always use a data cable, not a charge-only cable, for programming.',
  },
  headers: {
    look: 'Long straight strips of pins (male) or sockets (female) on a black or white 2.54 mm plastic base. 40 pins per strip, breakable at any position. Male: metal pins protrude 11 mm on one side, 3 mm on the PCB side. Female: round-hole sockets with a taller insulator body.',
    package: '2.54 mm pitch breakaway pin strip',
    leads: '40 positions, solderable, breakable to any length',
    uses: ['Arduino shields and sensor connections', 'Custom module headers', 'PCB-to-breadboard adapters', 'Breakout board construction'],
    tip: 'Score the plastic at the desired break point with a knife, then snap by hand or use flush cutters. Leave 1-2 extra pins when snapping — you can trim them. Solder while plastic is cool to avoid melting the housing.',
  },
  'cables/connectors': {
    look: 'JST connectors: Small white plastic housing with metal crimp terminals inside, locking tab on top. 2-4 pin variants. Screw terminal blocks: Green or blue plastic block with metal screw-tightened wire clamps and solder pins for PCB mounting.',
    package: 'PCB connector (JST, screw terminal, Molex)',
    leads: 'JST-XH: 2.5 mm pitch (JST-PH) or 2.54 mm (JST-XH). Screw terminal: 3.5 mm or 5.08 mm pitch.',
    uses: ['Battery-to-PCB connections', 'Motor driver wire connections', 'Sensor module power leads', 'Removable PCB connections'],
    tip: 'JST connectors are polarized and locking — do not force them the wrong way. Screw terminals can carry more current (10A+) than crimp connectors. Tighten screws firmly but not overtight to avoid stripping the plastic threads.',
  },
  'cables/test': {
    look: 'Alligator test leads: Flexible 50 cm wire with spring-loaded metal alligator clips on both ends. The clips open with a squeeze and close on any wire, pad, or component lead. Usually sold in sets of 10 colors.',
    package: 'Test cable with alligator clips',
    leads: 'N/A — clip-on',
    uses: ['Quick breadboard-free circuit testing', 'Multimeter extension leads', 'Connecting to bare pads and PCB test points', 'Battery clip connections'],
    tip: 'Great for quickly probing and powering circuits without a breadboard. The alligator teeth can scratch PCB traces on delicate boards — use soft-jaw clips or hook clips on fine-pitch PCBs.',
  },
  av: {
    look: 'HDMI: Rectangular metallic connector ~13x4 mm with chamfered bottom corners, 19 internal contacts. Ethernet (Cat5e): Wider RJ45 modular plug with a plastic latch clip and 8 internal copper contacts (wider than a phone RJ11 plug).',
    package: 'Cable with standard AV/network connectors',
    leads: 'HDMI: 19-pin digital video+audio. Cat5e RJ45: 8P8C for 100 Mbps/1 Gbps.',
    uses: ['Raspberry Pi to monitor connection (HDMI)', 'Wired IoT network connection (Ethernet)', 'Pi 4 display setup', 'Server/NAS prototyping'],
  },
  network: {
    look: 'Standard Cat5e patch cable with clear RJ45 connectors on both ends. 8 insulated wires (twisted pairs) inside. Visually wider than a phone cable — 8 gold contacts visible vs 4 in a phone plug.',
    package: 'Cat5e patch cable with RJ45',
    leads: 'RJ45 8P8C connector',
    uses: ['Wired network for Raspberry Pi', 'Wired IoT nodes', 'ENC28J60 Arduino Ethernet', 'Local network testing'],
  },

  // Displays
  lcd: {
    look: 'Rectangular PCB with a glass LCD panel showing a character grid (16 cols x 2 rows, or 20 cols x 4 rows). Green or blue backlight. The I2C version has a small blue PCF8574 IO expander backpack soldered to the back of the display, reducing wiring to 4 pins total.',
    package: 'LCD module with I2C adapter',
    leads: 'I2C version: VCC (5V), GND, SDA, SCL only (4 wires)',
    uses: ['Sensor data display', 'Menu interfaces', 'Digital clock projects', 'Equipment status readouts'],
    tip: 'Adjust the blue trimmer potentiometer on the I2C backpack to set contrast — without adjustment, the screen may appear blank (wrong contrast) even when receiving data. I2C address is usually 0x27 or 0x3F. Use the LiquidCrystal_I2C Arduino library.',
  },
  oled: {
    look: 'A tiny bright self-emitting display (~25 mm wide for 0.96", ~33 mm for 1.3") with pixels that emit their own light against a black background — no backlight visible on edges. Usually blue or white pixels on pure black. PCB has 4 pins at top or bottom.',
    package: 'I2C OLED module (4-pin)',
    leads: 'VCC (3.3-5V), GND, SCL, SDA',
    uses: ['Compact sensor readouts', 'IoT node status display', 'Wearable project screen', 'Low-power displays (no backlight)'],
    tip: 'Pixels that stay ON permanently degrade faster (burn-in). Use screen-saver code (blank after 30s inactivity). Default I2C address: 0x3C (sometimes 0x3D — check by running I2C scanner). Use the Adafruit SSD1306 + GFX libraries.',
  },
  '7segment': {
    look: 'A 4-digit 7-segment display module with bright red digit segments and a colon LED between digit pairs. The TM1637 driver IC is on the back with decoupling capacitors. Only 4 wires connect to Arduino.',
    package: '4-digit TM1637 module',
    leads: 'VCC (5V), GND, CLK, DIO (2-wire serial, not standard I2C)',
    uses: ['Digital clock displays', 'Score and counter displays', 'Thermostat readouts', 'Timers and stopwatches'],
    tip: 'TM1637 uses a custom 2-wire protocol (NOT standard I2C). Use the TM1637 Arduino library by Avishay Orpaz. Brightness is adjustable 0-7 via library. The colon between digits 2 and 3 is controlled separately.',
  },
  'led-strips': {
    look: 'A flexible PCB strip with equally-spaced RGB LED pixels. WS2812B LEDs each have a tiny driver IC inside the LED package itself (visible as a small square inside the large LED lens). Neopixel rings are circular versions of the same technology.',
    package: 'Flexible LED strip (WS2812B) or circular ring (Neopixel)',
    leads: 'WS2812B: 5V, GND, DIN (data in) — chainable via DOUT',
    uses: ['Decorative ambient lighting', 'Level meters and gauges', 'Status indicators', 'Animation and light shows'],
    tip: 'Add a 470Ω resistor in series with DIN close to the first LED to dampen ringing. Add a 100-1000 µF capacitor across 5V/GND at the first LED. Each LED draws up to 60 mA at full white — a 1m/60 LED strip needs up to 3.6A at 5V.',
  },
  leds: {
    look: 'A small transparent or colored dome-shaped lens, either 3 mm or 5 mm in diameter, with two metal wire leads at the base. The longer lead is the ANODE (+). The shorter lead is the CATHODE (−). Looking at the flat base, the inside of the lens has a flat edge on the cathode side.',
    package: 'THT 5mm LED (or 3mm)',
    leads: 'Anode (+) = longer lead. Cathode (−) = shorter lead (flat edge on lens base).',
    uses: ['Power and status indicators', 'Panel mount lights', 'Traffic light simulations', 'Decorative lighting projects'],
    tip: 'ALWAYS use a current-limiting resistor (usually 220-470 Ω with 5V). Without one, the LED will burn out immediately. Formula: R = (Vsupply − Vforward) / Idesired. Vforward ≈ 2V (red/yellow/green) or 3.2V (blue/white). Target 10-20 mA.',
  },
  matrix: {
    look: 'An 8x8 grid of 64 LEDs (usually red) on a square PCB module with the MAX7219 driver chip underneath. Five-wire SPI interface: VCC, GND, DIN, CLK, CS. Often stackable — DOUT connects to next module DIN.',
    package: 'PCB module with MAX7219 SPI driver',
    leads: 'VCC (5V), GND, DIN, CLK, CS',
    uses: ['Scrolling text marquees', 'Sprite animations', 'Binary counter displays', 'Simple games (Snake, Tetris)'],
    tip: 'Up to 8 matrices can be daisy-chained (DOUT → DIN). Use the MD_Parola or LedControl library. Connect a 10 µF and 0.1 µF capacitor across VCC-GND near each module to prevent power noise from causing flicker.',
  },
  tft: {
    look: 'A color LCD touchscreen panel on a PCB with a row of pin headers at one end. The ILI9341 controller makes it 240x320 pixels with 16-bit color. A slightly gold-tinted resistive touch overlay covers the display surface. Usually 2.4" diagonal.',
    package: 'SPI TFT LCD module with touch',
    leads: 'VCC, GND, CS, RST, DC/RS, SDI/MOSI, SCK, LED (backlight brightness), T_CS, T_CLK, T_DIN, T_DO (touch SPI)',
    uses: ['Advanced GUIs and dashboards', 'Real-time data graphs', 'Camera viewfinder (with ESP32-CAM)', 'Interactive games and menus'],
    tip: 'Use the Adafruit ILI9341 + GFX libraries. Touch requires separate calibration (use STMPE610 or XPT2046 library depending on the touch IC). Backlight LED pin can be PWM-dimmed for brightness control. The display SPI and touch SPI often share CLK/MOSI but need separate CS lines.',
  },

  // Wireless
  bluetooth: {
    look: 'Small rectangular PCB module (~28x13 mm) with a small status LED and a chip antenna (a tiny ceramic rectangle or PCB trace). HC-05 has an additional KEY button for entering AT command mode and a small IC on the back. HC-06 is slightly simpler with no KEY button.',
    package: 'UART Bluetooth module (2.54mm header)',
    leads: 'VCC (5V — module regulates to 3.3V internally), GND, TXD, RXD, STATE (HC-05 also: KEY)',
    uses: ['Wireless serial communication', 'Phone-controlled Arduino projects', 'Wireless data logging', 'Bluetooth keyboard/remote'],
    tip: 'HC-05 blinks every 2 seconds when not paired (searching), every 500ms when in AT mode, and stays on when paired. Default baud rate: 9600. Use AT commands (KEY pin HIGH) to change name, baud rate, and PIN code. Note: Bluetooth 2.0 (Classic) — not BLE.',
  },
  rf: {
    look: 'NRF24L01+: Very small square PCB (~29x15 mm) with a PCB trace or stubby external antenna. 8-pin 2.54 mm header. 433 MHz pair: TX module is tiny (~19x19 mm) with few components; RX module is larger (~30x14 mm) with more filtering ICs.',
    package: 'SPI module (NRF24L01) or ASK OOK pair (433 MHz)',
    leads: 'NRF24L01: VCC (3.3V!), GND, CE, CSN, SCK, MOSI, MISO, IRQ',
    uses: ['Wireless sensor networks', 'Remote control cars and drones', '2.4GHz mesh networks', 'Low-power telemetry'],
    tip: 'NRF24L01 runs at 3.3V — connecting to 5V directly damages it. Add a 100 µF capacitor across VCC-GND right at the module to prevent brown-out from RF transmission spikes. The + version (NRF24L01+PA+LNA) adds a power amplifier for ~1 km range with external antenna.',
  },
  gsm: {
    look: 'Small rectangular PCB (~25x23 mm) with a SIM card tray on the bottom edge, a small ceramic patch antenna, a status LED, and the SIM800L chip visible on top surface. Module color is usually green or blue.',
    package: 'UART GSM module with SIM slot',
    leads: 'VCC (3.7-4.2V — critical!), GND, TXD, RXD, RST',
    uses: ['SMS-based alerts and notifications', 'Remote monitoring via cellular', 'GPS tracking systems (with GPS module)', 'IoT data SIM connectivity'],
    tip: 'SIM800L needs 3.7-4.2V (NOT 5V!) and peaks at ~2A during GSM transmit. Use a dedicated LiPo battery or a 3.7V LDO regulator with 2200 µF+ capacitors. Power supply noise causes random resets — a bulk capacitor is non-negotiable.',
  },
  rfid: {
    look: 'RC522: Rectangular red PCB (~60x40 mm) with the RC522 chip and a large rectangular copper antenna coil forming most of the PCB area. Comes with one or more white MIFARE Classic cards (credit-card sized) and plastic key fob tags.',
    package: 'SPI RFID module + cards/fobs',
    leads: 'VCC (3.3V), GND, RST, IRQ, MISO, MOSI, SCK, SDA (CS)',
    uses: ['Door access control', 'Student attendance tracking', 'Inventory tracking tags', 'Electronic lock/key systems'],
    tip: 'RC522 runs at 3.3V — do not connect VCC to 5V. Works at 13.56 MHz with ISO 14443A MIFARE cards. Use the MFRC522 Arduino library. Read range is typically 3-5 cm. MIFARE Classic cards store data in 16 sectors of 4 blocks (64 bytes total).',
  },
  gps: {
    look: 'Small PCB (~28x26 mm) with the NEO-6M chip and a square ceramic patch antenna (white or silver square) on top. A green LED blinks once per second when satellite fix is acquired. A small backup battery CR2032 holder may also be present.',
    package: 'UART GPS module with ceramic antenna',
    leads: 'VCC (5V), GND, TXD, RXD, (PPS — pulse-per-second sync output)',
    uses: ['Vehicle and asset tracking', 'Outdoor navigation systems', 'Geofencing alerts', 'Time synchronization (PPS)'],
    tip: 'GPS needs a clear unobstructed view of the sky. First cold start fix takes 1-5 minutes. Subsequent warm/hot starts take only seconds. The LED blink is the most reliable indicator of fix — no blink means still searching. Use the TinyGPS++ library.',
  },
  ethernet: {
    look: 'ENC28J60: Small rectangular PCB (~55x30 mm) with an RJ45 Ethernet socket on one end and the ENC28J60 chip in the center. SPI interface with a 10-pin header. Fitted with a transformer inside the RJ45 socket.',
    package: 'SPI Ethernet module',
    leads: 'VCC (3.3V), GND, SO (MISO), SI (MOSI), SCK, CS, (INT, RST)',
    uses: ['Wired internet connectivity for Arduino Uno', 'Web server on microcontroller', 'IoT LAN devices', 'Email client / HTTP requests'],
    tip: 'ENC28J60 runs at 3.3V. Use the EtherCard or UIPEthernet library — it is lighter than the official Ethernet library. Only supports 10 Mbps. Add a level shifter or use with 3.3V MCU for best results.',
  },
  wifi: {
    look: 'ESP-01 WiFi relay: A small PCB with an ESP-01 module (ultra-small 14x24 mm PCB with metal RF can) and a relay soldered onto a carrier board. The ESP-01 itself has two rows of 4 pads and a ceramic antenna protruding from one end.',
    package: 'WiFi relay PCB module',
    leads: 'VCC (3.3V), GND, GPIO0, GPIO2, TX, RX',
    uses: ['IoT relay switching via WiFi', 'HTTP command-controlled appliances', 'Smart home switch modules', 'MQTT relay node'],
    tip: 'ESP-01 only exposes 2 GPIO pins (GPIO0 and GPIO2). For projects needing more GPIO, use the full NodeMCU or ESP32 DevKit. Program via USB-TTL adapter with GPIO0 pulled LOW (to GND) on power-up to enter flash mode.',
  },

  // Motors
  drivers: {
    look: 'L298N module: Large PCB (~43x43 mm) with a tall metal heatsink fin across the top, a cylindrical electrolytic capacitor, and two thick motor output screw terminals. DRV8833: Smaller PCB (~20x20 mm) with a compact profile, no heatsink. A4988: Tiny rectangular PCB (~16x16 mm) with a small driver chip and current-limit trimmer.',
    package: 'PCB motor driver module',
    leads: 'L298N: ENA, IN1, IN2, IN3, IN4, ENB for two channels + power terminals. A4988: STEP, DIR, VDD, GND, VMOT, 1B/1A/2A/2B (coil outputs).',
    uses: ['2 DC motor control (L298N)', '1 stepper motor control (L298N/A4988)', 'Small robot drive trains', 'Conveyor and belt systems'],
    tip: 'On L298N: remove the ENA/ENB jumpers to enable PWM speed control via those pins. The on-board 5V voltage regulator works ONLY if motor power is 7V or more — otherwise bypass it. For motors over 35V or 2A, use dedicated MOSFET H-bridge modules.',
  },
  dc: {
    look: 'TT (toy/tank) gearmotor: Compact rectangular yellow or blue plastic gearbox (~50x23x20 mm) with a dual-shaft output and two push-on wires. The DC motor is embedded inside the gearbox housing. Wheels clip onto the D-shaped axle shafts.',
    package: 'DC gearmotor with plastic gearbox',
    leads: '2 wires — swap polarity to reverse direction',
    uses: ['Robot car drive wheels', 'Conveyor belt mechanisms', 'Toy vehicle projects', 'Educational robotics'],
    tip: 'TT motors have a built-in ~1:48 gear reduction giving higher torque at lower RPM. At 3-6V they spin ~100-200 RPM. Buy in pairs for 2WD robots — they are NOT perfectly matched from the factory, so closed-loop encoder control improves straight-line accuracy.',
  },
  servo: {
    look: 'Rectangular plastic housing (~23x12x27 mm for SG90 micro servo) with a round gear horn (output shaft) on top and a 3-wire lead cable coming out the side. Lead colors: Brown/Black = GND, Red = VCC (+5V), Orange/Yellow/White = Signal (PWM).',
    package: 'Hobby servo (3-pin connector)',
    leads: 'Brown = GND, Red = VCC (+5V), Orange = Signal (50 Hz PWM)',
    uses: ['Robot arm joints', 'RC car steering', 'Pan/tilt camera mount', 'Door latch/valve actuator'],
    tip: 'Control with 50 Hz PWM: 1 ms pulse width = 0°, 1.5 ms = 90°, 2 ms = 180°. The Arduino Servo library handles all timing. SG90 supports up to ~1.8 kg-cm torque; the MG995 metal-gear servo handles ~9 kg-cm for heavier loads.',
  },
  stepper: {
    look: '28BYJ-48: Small blue or red-capped cylindrical motor (~34 mm diameter), with a white plastic gear shaft output and a 5-wire JST connector. NEMA 17: Larger flat-faced square motor (42x42 mm face) with 4 wires and a 5 mm D-shaft axle.',
    package: 'Stepper motor',
    leads: '28BYJ-48: 5 wires (4 coil wires + common). NEMA 17: 4 wires (2 coils, color-coded pairs).',
    uses: ['CNC milling machines', '3D printer axes', 'Telescope slewing', 'Precision turntable / rotary positioning'],
    tip: '28BYJ-48 needs the ULN2003 driver board (usually included). It has 64 internal motor steps × 64:1 gear = ~4096 steps/revolution. NEMA 17 has 200 steps/rev (1.8°/step). Use A4988 or DRV8825 driver for microstepping (up to 1/32 step = 0.056° precision).',
  },
  chassis: {
    look: 'Flat acrylic or metal (aluminum) base plate with pre-drilled motor mount holes, caster ball wheel mount, and battery holder compartment. 2WD kits have 2 TT motor mounts; 4WD kits have 4. Comes with screws, spacers, and sometimes a circuit board standoff post.',
    package: 'Robot chassis kit (mechanical only)',
    leads: 'N/A — mechanical assembly; motors connect to driver board separately',
    uses: ['Line follower robot base', 'Obstacle avoidance robot', 'Remote-controlled car', '2WD/4WD learning robotics platform'],
    tip: 'Install motors first — the body is tightest to assemble with no PCBs yet attached. Use thread-locking adhesive (Loctite) on the motor mounting screws to prevent vibration-loosening. Secure all wiring with zip ties before the first drive test.',
  },
};

function getTip(product: EditableProduct): ComponentTip {
  const s = product.subcategory ?? '';
  const cat = product.category;
  // Try composite key first (for subcategories that exist in multiple categories)
  return (
    TIPS[`${cat}/${s}`] ??
    TIPS[s] ??
    TIPS[cat] ??
    DEFAULT_TIP
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Density = 'compact' | 'normal' | 'large';

interface CardProps {
  product: EditableProduct;
  hidePrices: boolean;
  hovered: boolean;
  density: Density;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

interface ModalProps {
  product: EditableProduct;
  onClose: () => void;
  onSelectProduct: (p: EditableProduct) => void;
  hidePrices: boolean;
  allProducts: EditableProduct[];
}

// ── Density config ─────────────────────────────────────────────────────────
const densityCols: Record<Density, string> = {
  compact: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8',
  normal:  'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  large:   'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

const densityOptions: { key: Density; icon: LucideIcon; label: string }[] = [
  { key: 'compact', icon: Grid3x3,   label: 'Compact' },
  { key: 'normal',  icon: Grid2x2,   label: 'Normal'  },
  { key: 'large',   icon: LayoutGrid, label: 'Large'  },
];

// ══════════════════════════════════════════════════════════════════════════════
// Main page component
// ══════════════════════════════════════════════════════════════════════════════
export default function VisualGuidePage() {
  const { products, hidePrices } = useStaff();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [selected, setSelected] = useState<EditableProduct | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [density, setDensity] = useState<Density>('normal');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let result = [...products];
    if (activeCategory) result = result.filter(p => p.category === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(p => {
        const tip = getTip(p);
        return (
          p.name.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
          tip.look.toLowerCase().includes(q) ||
          tip.package.toLowerCase().includes(q) ||
          tip.leads.toLowerCase().includes(q) ||
          tip.uses.some(u => u.toLowerCase().includes(q)) ||
          (tip.tip ? tip.tip.toLowerCase().includes(q) : false)
        );
      });
    }
    return result;
  }, [products, query, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map<string, EditableProduct[]>();
    for (const p of filtered) {
      const key = p.subcategory || p.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return [...map.entries()];
  }, [filtered]);

  const clearSearch = () => { setQuery(''); setActiveCategory(''); inputRef.current?.focus(); };

  const gridCols = densityCols[density];
  const isSearching = query.trim() !== '' || activeCategory !== '';

  return (
    <div className="pt-16 min-h-screen bg-[var(--light-gray)]">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[var(--medium-gray)]">
        <div className="max-w-[1280px] mx-auto px-[5%] py-10">
          <div className="text-sm text-[var(--text-muted)] mb-3">
            <Link to="/" className="hover:text-[var(--teal)]">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--charcoal)]">Visual Component Guide</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--charcoal)] mb-2">
                Visual Component Guide
              </h1>
              <p className="text-[var(--text-muted)] max-w-xl">
                Identify any electronic component by how it looks. Browse {products.length}+ components with real photos and physical identification tips — essential for students and beginners.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="flex gap-1 bg-[var(--light-gray)] rounded-xl p-1">
                {densityOptions.map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    title={label}
                    onClick={() => setDensity(key)}
                    className={`p-2 rounded-lg transition-all ${density === key ? 'bg-white text-[var(--teal)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--charcoal)]'}`}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, appearance, use case... e.g. blue cylindrical cap, NPN transistor, humidity"
              className="w-full bg-white border-2 border-[var(--medium-gray)] rounded-2xl pl-12 pr-12 py-4 text-sm outline-none focus:border-[var(--teal)] transition-colors shadow-sm"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--light-gray)] transition-colors"
              >
                <X size={16} className="text-[var(--text-muted)]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Category strip ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-[var(--medium-gray)] sticky top-16 z-30 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-[5%]">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
            <button
              onClick={() => setActiveCategory('')}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeCategory === '' ? 'bg-[var(--teal)] text-white' : 'bg-[var(--light-gray)] text-[var(--charcoal)] hover:bg-[var(--teal-light)] hover:text-[var(--teal)]'}`}
            >
              All ({products.length})
            </button>
            {categories.map(cat => {
              const count = products.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? '' : cat.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeCategory === cat.id ? 'bg-[var(--teal)] text-white' : 'bg-[var(--light-gray)] text-[var(--charcoal)] hover:bg-[var(--teal-light)] hover:text-[var(--teal)]'}`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Results summary ─────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-[5%] pt-5 pb-2 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-[var(--text-muted)]">
          {isSearching
            ? <><span className="font-semibold text-[var(--charcoal)]">{filtered.length}</span> component{filtered.length !== 1 ? 's' : ''} found{query && <> matching <span className="text-[var(--teal)] font-semibold">{query}</span></>}</>
            : <><span className="font-semibold text-[var(--charcoal)]">{filtered.length}</span> components — click any to learn how to identify it</>
          }
        </p>
        {isSearching && (
          <button onClick={clearSearch} className="text-xs text-[var(--teal)] hover:underline font-semibold">
            Clear filters
          </button>
        )}
      </div>

      {/* ── Component grid ──────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-[5%] pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <Cpu size={52} className="mx-auto mb-4 text-[var(--text-muted)] opacity-25" />
            <p className="text-lg font-semibold text-[var(--charcoal)] mb-2">No components found</p>
            <p className="text-sm text-[var(--text-muted)] mb-5">
              Try searching by appearance — e.g. "cylindrical", "dome", "blue module", or "3 legs"
            </p>
            <button onClick={clearSearch} className="px-5 py-2.5 bg-[var(--teal)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--teal-dark)] transition-colors">
              Show all components
            </button>
          </div>
        ) : isSearching ? (
          /* Flat grid when searching */
          <div className={`grid ${gridCols} gap-3 mt-4`}>
            {filtered.map(p => (
              <ComponentCard
                key={p.id}
                product={p}
                hidePrices={hidePrices}
                density={density}
                hovered={hoveredId === p.id}
                onHover={() => setHoveredId(p.id)}
                onLeave={() => setHoveredId(null)}
                onClick={() => setSelected(p)}
              />
            ))}
          </div>
        ) : (
          /* Grouped by subcategory when browsing */
          grouped.map(([groupName, items]) => (
            <div key={groupName} className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-bold text-[var(--charcoal)] uppercase tracking-wide capitalize">{groupName}</h2>
                <span className="text-xs font-semibold text-[var(--teal)] bg-[var(--teal-light)] px-2.5 py-0.5 rounded-full">{items.length}</span>
                <div className="flex-1 h-px bg-[var(--medium-gray)]" />
              </div>
              <div className={`grid ${gridCols} gap-3`}>
                {items.map(p => (
                  <ComponentCard
                    key={p.id}
                    product={p}
                    hidePrices={hidePrices}
                    density={density}
                    hovered={hoveredId === p.id}
                    onHover={() => setHoveredId(p.id)}
                    onLeave={() => setHoveredId(null)}
                    onClick={() => setSelected(p)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selected && (
        <ComponentModal
          product={selected}
          onClose={() => setSelected(null)}
          onSelectProduct={setSelected}
          hidePrices={hidePrices}
          allProducts={products}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ComponentCard
// ══════════════════════════════════════════════════════════════════════════════
function ComponentCard({ product, hidePrices, hovered, density, onHover, onLeave, onClick }: CardProps) {
  const [imgError, setImgError] = useState(false);
  const IconComponent = (iconMap[product.icon] ?? CpuIcon) as LucideIcon;
  const tip = getTip(product);
  const showPackage = density === 'large';
  const showImage = !!product.image && !imgError;

  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`group bg-white rounded-2xl border overflow-hidden text-left transition-all duration-200 ${
        hovered ? 'border-[var(--teal)] shadow-lg -translate-y-1' : 'border-[var(--medium-gray)] hover:border-[var(--teal)] hover:shadow-md'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-[var(--light-gray)] to-white flex items-center justify-center overflow-hidden">
        {showImage ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-[var(--medium-gray)] flex items-center justify-center text-[var(--teal)]">
            <IconComponent size={28} strokeWidth={1.5} />
          </div>
        )}

        {/* Hover zoom hint */}
        <div className={`absolute inset-0 bg-[var(--teal)]/10 flex items-center justify-center transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center">
            <ZoomIn size={16} className="text-[var(--teal)]" />
          </div>
        </div>

        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${product.badge === 'sale' ? 'bg-[var(--amber)] text-white' : 'bg-[var(--teal)] text-white'}`}>
            {product.badge === 'sale' ? 'SALE' : 'TOP'}
          </span>
        )}
      </div>

      {/* Info */}
      <div className={`${density === 'compact' ? 'p-2' : 'p-3'}`}>
        <p className="text-[10px] font-semibold text-[var(--teal)] uppercase tracking-wider mb-0.5 truncate">
          {product.subcategory || product.category}
        </p>
        <p className={`font-semibold text-[var(--charcoal)] leading-snug line-clamp-2 ${density === 'compact' ? 'text-[10px] min-h-[2rem]' : 'text-xs min-h-[2.5rem]'}`}>
          {product.name}
        </p>
        {showPackage && (
          <p className="text-[10px] text-[var(--text-muted)] mt-1 truncate">{tip.package}</p>
        )}
        {!hidePrices && (
          <p className={`font-extrabold text-[var(--teal)] mt-1.5 ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
            KSh {product.price.toLocaleString()}
          </p>
        )}
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ComponentModal — educational identification panel
// ══════════════════════════════════════════════════════════════════════════════
function ComponentModal({ product, onClose, onSelectProduct, hidePrices, allProducts }: ModalProps) {
  const { addToCart } = useCart();
  const [lightbox, setLightbox] = useState(false);
  const [modalImgError, setModalImgError] = useState(false);
  const tip = getTip(product);
  const modalShowImage = !!product.image && !modalImgError;

  const related = useMemo(() =>
    allProducts
      .filter(p => p.id !== product.id && (p.subcategory === product.subcategory && p.subcategory != null))
      .slice(0, 8),
    [allProducts, product]
  );

  return (
    <>
      {/* Backdrop + modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--medium-gray)] shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <span className="capitalize font-medium">{product.category}</span>
              {product.subcategory && (
                <>
                  <ChevronRight size={11} />
                  <span className="capitalize font-medium">{product.subcategory}</span>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[var(--light-gray)] rounded-lg transition-colors"
            >
              <X size={18} className="text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">
            {/* Image + Info grid */}
            <div className="grid md:grid-cols-2">

              {/* Image side */}
              <div className="relative aspect-square bg-gradient-to-br from-[var(--light-gray)] to-white flex items-center justify-center overflow-hidden md:border-r border-b md:border-b-0 border-[var(--medium-gray)]">
                {modalShowImage ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-8 cursor-zoom-in"
                    onClick={() => setLightbox(true)}
                    onError={() => setModalImgError(true)}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-white shadow border border-[var(--medium-gray)] flex items-center justify-center text-[var(--teal)]">
                    <CpuIcon size={48} strokeWidth={1.5} />
                  </div>
                )}

                {/* Zoom button */}
                {modalShowImage && (
                  <button
                    onClick={() => setLightbox(true)}
                    title="Zoom image"
                    className="absolute bottom-4 right-4 p-2.5 bg-white/90 hover:bg-[var(--teal)] hover:text-white text-[var(--teal)] rounded-xl shadow border border-[var(--medium-gray)] hover:border-[var(--teal)] transition-all duration-200"
                  >
                    <ZoomIn size={16} />
                  </button>
                )}

                {/* Badge overlay */}
                {product.badge && (
                  <span className={`absolute top-4 left-4 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${product.badge === 'sale' ? 'bg-[var(--amber)] text-white' : 'bg-[var(--teal)] text-white'}`}>
                    {product.badge === 'sale' ? 'ON SALE' : 'TOP PICK'}
                  </span>
                )}
              </div>

              {/* Info side */}
              <div className="p-5 flex flex-col gap-4">

                {/* Package chip + name */}
                <div>
                  <span className="inline-block text-[10px] font-bold text-[var(--text-muted)] bg-[var(--light-gray)] px-2.5 py-1 rounded-full uppercase tracking-wide mb-2">
                    {tip.package}
                  </span>
                  <h2 className="text-lg font-extrabold text-[var(--charcoal)] leading-snug">{product.name}</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">{product.desc}</p>
                </div>

                {/* Identify section */}
                <div className="bg-[var(--teal-light)]/40 border border-[var(--teal)]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[var(--teal)] flex items-center justify-center flex-shrink-0">
                      <Eye size={13} className="text-white" />
                    </div>
                    <span className="text-[11px] font-bold text-[var(--teal)] uppercase tracking-wider">How to identify it</span>
                  </div>
                  <p className="text-xs text-[var(--charcoal)] leading-relaxed">{tip.look}</p>
                  {tip.leads && tip.leads !== 'See datasheet' && (
                    <div className="mt-2.5 pt-2.5 border-t border-[var(--teal)]/15">
                      <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                        <span className="font-semibold text-[var(--charcoal)]">Pins/leads: </span>{tip.leads}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pro tip */}
                {tip.tip && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                    <div className="flex items-start gap-2">
                      <Lightbulb size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-900 leading-relaxed">{tip.tip}</p>
                    </div>
                  </div>
                )}

                {/* Common uses */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Common uses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tip.uses.map(use => (
                      <span key={use} className="text-[11px] bg-[var(--light-gray)] text-[var(--charcoal)] px-2.5 py-1 rounded-full border border-[var(--medium-gray)]">
                        {use}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price + action buttons */}
                <div className="pt-3 border-t border-[var(--medium-gray)]">
                  {!hidePrices && (
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-extrabold text-[var(--teal)]">
                        KSh {product.price.toLocaleString()}
                      </span>
                      {product.oldPrice && (
                        <span className="text-sm text-[var(--text-muted)] line-through">
                          KSh {product.oldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        addToCart({ id: product.id, name: product.name, price: product.price, icon: product.icon });
                        onClose();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--teal)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--teal-dark)] transition-colors shadow-sm shadow-[var(--teal)]/20"
                    >
                      <ShoppingCart size={15} />
                      Add to Cart
                    </button>
                    <Link
                      to={`/products?highlight=${product.id}`}
                      onClick={onClose}
                      className="px-4 py-2.5 border border-[var(--medium-gray)] text-[var(--charcoal)] text-sm font-semibold rounded-xl hover:border-[var(--teal)] hover:bg-[var(--teal-light)] transition-all flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <ArrowUpRight size={15} />
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Related components */}
            {related.length > 0 && (
              <div className="px-5 py-4 border-t border-[var(--medium-gray)] bg-[var(--light-gray)]/50">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  More in {product.subcategory || product.category}
                </p>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                  {related.map(p => (
                    <button
                      key={p.id}
                      title={p.name}
                      onClick={() => onSelectProduct(p)}
                      className="shrink-0 flex flex-col items-center gap-1.5 group/rel"
                    >
                      <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-[var(--medium-gray)] group-hover/rel:border-[var(--teal)] transition-colors">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" loading="lazy" />
                        ) : (
                          <CpuIcon size={22} className="text-[var(--teal)]" strokeWidth={1.5} />
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--charcoal)] text-center w-16 leading-tight line-clamp-2 group-hover/rel:text-[var(--teal)] transition-colors">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image lightbox */}
      {lightbox && modalShowImage && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 cursor-zoom-out"
          onClick={() => setLightbox(false)}
        >
          <img
            src={product.image}
            alt={product.name}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={e => e.stopPropagation()}
          />
          <p className="mt-4 text-white/60 text-sm font-medium px-4 text-center">{product.name}</p>
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-5 right-5 p-2.5 bg-white/15 hover:bg-white/30 rounded-xl text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>
      )}
    </>
  );
}
