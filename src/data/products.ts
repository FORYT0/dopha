export interface Product {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  oldPrice: number | null;
  desc: string;
  icon: string;
  badge: 'sale' | 'tum' | null;
  stock: number;
  specs?: Record<string, string>;
}

export const categories = [
  { id: 'microcontrollers', name: 'Microcontrollers', icon: 'Cpu', description: 'Arduino, ESP32, Raspberry Pi, STM32 boards and starter kits', count: 120 },
  { id: 'passive', name: 'Passive Components', icon: 'Zap', description: 'Resistors, capacitors, inductors, potentiometers, crystals', count: 500 },
  { id: 'active', name: 'Active Components', icon: 'Activity', description: 'Transistors, diodes, ICs, voltage regulators, op-amps', count: 350 },
  { id: 'sensors', name: 'Sensors & Modules', icon: 'Thermometer', description: 'Temperature, humidity, motion, gas, ultrasonic, IR sensors', count: 200 },
  { id: 'power', name: 'Power Supplies', icon: 'Battery', description: 'Adapters, batteries, chargers, solar panels, power banks', count: 80 },
  { id: 'tools', name: 'Tools & Equipment', icon: 'Wrench', description: 'Soldering irons, multimeters, oscilloscopes, breadboards', count: 150 },
  { id: 'cables', name: 'Cables & Connectors', icon: 'Cable', description: 'Jumper wires, ribbon cables, HDMI, USB, audio cables', count: 300 },
  { id: 'displays', name: 'Displays & LEDs', icon: 'Monitor', description: 'LCDs, OLEDs, 7-segment, LED strips, dot matrix displays', count: 100 },
  { id: 'wireless', name: 'IoT & Wireless', icon: 'Wifi', description: 'Bluetooth, WiFi, RF, LoRa, GSM modules', count: 75 },
  { id: 'motors', name: 'Motors & Drivers', icon: 'Cog', description: 'DC motors, stepper motors, servo motors, motor drivers', count: 60 },
];

export const products: Product[] = [
  // Arduino & Microcontrollers
  { id: 1, name: 'Arduino Uno R3 (Original)', category: 'microcontrollers', subcategory: 'arduino', price: 1700, oldPrice: 2000, desc: 'ATmega328P microcontroller board with USB cable. Essential for TUM intro to microcontrollers courses.', icon: 'Cpu', badge: 'sale', stock: 50 },
  { id: 2, name: 'Arduino Nano V3 (CH340)', category: 'microcontrollers', subcategory: 'arduino', price: 1000, oldPrice: 1300, desc: 'Compact board with CH340 chip. Ideal for mini projects and breadboard prototyping.', icon: 'Cpu', badge: 'sale', stock: 45 },
  { id: 3, name: 'Arduino Uno R4 WiFi', category: 'microcontrollers', subcategory: 'arduino', price: 6000, oldPrice: 7000, desc: '32-bit ARM Cortex-M4 with built-in WiFi/Bluetooth. For advanced IoT and embedded systems.', icon: 'Cpu', badge: 'tum', stock: 20 },
  { id: 4, name: 'Arduino Mega 2560', category: 'microcontrollers', subcategory: 'arduino', price: 3500, oldPrice: null, desc: '54 digital I/O pins, 16 analog inputs. For complex projects needing many pins.', icon: 'Cpu', badge: null, stock: 25 },
  { id: 5, name: 'Arduino Starter Kit', category: 'microcontrollers', subcategory: 'kits', price: 6500, oldPrice: 7500, desc: 'Complete kit with Uno R3, sensors, LEDs, resistors, breadboard & project guide.', icon: 'Cpu', badge: 'tum', stock: 30 },
  { id: 6, name: 'ESP32 DevKit V1', category: 'microcontrollers', subcategory: 'esp', price: 1200, oldPrice: null, desc: 'Dual-core WiFi + Bluetooth SoC. For IoT, wireless communication & smart devices.', icon: 'Wifi', badge: 'tum', stock: 40 },
  { id: 7, name: 'ESP32-CAM', category: 'microcontrollers', subcategory: 'esp', price: 900, oldPrice: null, desc: 'ESP32 with OV2640 camera. For image processing and surveillance projects.', icon: 'Camera', badge: null, stock: 30 },
  { id: 8, name: 'Raspberry Pi Pico W', category: 'microcontrollers', subcategory: 'rpi', price: 1800, oldPrice: null, desc: 'RP2040 dual-core ARM Cortex-M0+ with WiFi. MicroPython support.', icon: 'Cpu', badge: null, stock: 20 },
  { id: 9, name: 'Raspberry Pi 4 (4GB)', category: 'microcontrollers', subcategory: 'rpi', price: 12000, oldPrice: null, desc: 'Full Linux computer for advanced embedded and IoT gateway projects.', icon: 'Monitor', badge: null, stock: 10 },
  { id: 10, name: 'STM32F103C8T6 (Blue Pill)', category: 'microcontrollers', subcategory: 'stm', price: 800, oldPrice: null, desc: 'ARM Cortex-M3, 72MHz. For learning ARM architecture and advanced embedded.', icon: 'Cpu', badge: null, stock: 25 },
  { id: 11, name: 'NodeMCU ESP8266', category: 'microcontrollers', subcategory: 'esp', price: 700, oldPrice: null, desc: 'WiFi-enabled microcontroller for IoT projects. Lua/Arduino IDE compatible.', icon: 'Wifi', badge: null, stock: 35 },
  { id: 12, name: 'Attiny85 Digispark', category: 'microcontrollers', subcategory: 'arduino', price: 350, oldPrice: null, desc: 'Tiny USB-enabled microcontroller for simple, low-cost projects.', icon: 'Cpu', badge: null, stock: 50 },

  // Sensors
  { id: 13, name: 'DHT22 Temperature & Humidity Sensor', category: 'sensors', subcategory: 'environmental', price: 450, oldPrice: null, desc: 'High precision digital sensor. Range: -40 to 80C, 0-100% RH.', icon: 'Thermometer', badge: null, stock: 60 },
  { id: 14, name: 'DHT11 Temperature & Humidity Sensor', category: 'sensors', subcategory: 'environmental', price: 250, oldPrice: null, desc: 'Basic digital temperature and humidity sensor. Good for beginners.', icon: 'Thermometer', badge: null, stock: 70 },
  { id: 15, name: 'HC-SR04 Ultrasonic Sensor', category: 'sensors', subcategory: 'distance', price: 350, oldPrice: null, desc: 'Distance measuring: 2cm to 400cm. For robotics and automation projects.', icon: 'Ruler', badge: null, stock: 55 },
  { id: 16, name: 'PIR Motion Sensor Module', category: 'sensors', subcategory: 'motion', price: 280, oldPrice: null, desc: 'Passive infrared motion detector. Range: up to 7m. For security systems.', icon: 'Eye', badge: null, stock: 45 },
  { id: 17, name: 'MQ-2 Gas/Smoke Sensor', category: 'sensors', subcategory: 'gas', price: 400, oldPrice: null, desc: 'Detects LPG, propane, methane, alcohol, hydrogen, smoke. Analog output.', icon: 'Flame', badge: null, stock: 40 },
  { id: 18, name: 'MQ-135 Air Quality Sensor', category: 'sensors', subcategory: 'gas', price: 450, oldPrice: null, desc: 'Detects NH3, NOx, alcohol, benzene, smoke, CO2. For air quality monitors.', icon: 'Wind', badge: null, stock: 35 },
  { id: 19, name: 'LDR Photoresistor Module', category: 'sensors', subcategory: 'light', price: 200, oldPrice: null, desc: 'Light dependent resistor module. For automatic lighting control projects.', icon: 'Sun', badge: null, stock: 80 },
  { id: 20, name: 'Soil Moisture Sensor', category: 'sensors', subcategory: 'environmental', price: 250, oldPrice: null, desc: 'Measures soil moisture level. For agriculture and plant watering projects.', icon: 'Droplets', badge: null, stock: 50 },
  { id: 21, name: 'IR Proximity Sensor (TCRT5000)', category: 'sensors', subcategory: 'line', price: 200, oldPrice: null, desc: 'Reflective IR sensor. For line following robots and obstacle detection.', icon: 'Scan', badge: null, stock: 60 },
  { id: 22, name: 'Sound Sensor Module (KY-038)', category: 'sensors', subcategory: 'audio', price: 250, oldPrice: null, desc: 'Detects sound intensity via microphone. For clap switches and audio projects.', icon: 'Mic', badge: null, stock: 40 },
  { id: 23, name: 'Heartbeat Sensor (Pulse Sensor)', category: 'sensors', subcategory: 'medical', price: 600, oldPrice: null, desc: 'Plug-and-play heart rate sensor. For health monitoring projects.', icon: 'Heart', badge: null, stock: 20 },
  { id: 24, name: 'BMP180 Barometric Pressure Sensor', category: 'sensors', subcategory: 'environmental', price: 400, oldPrice: null, desc: 'Measures pressure and temperature. For weather station projects.', icon: 'Cloud', badge: null, stock: 25 },
  { id: 25, name: 'Infrared Obstacle Avoidance Sensor', category: 'sensors', subcategory: 'distance', price: 180, oldPrice: null, desc: 'Digital output obstacle detection. Range: 2-30cm. For robot cars.', icon: 'AlertTriangle', badge: null, stock: 50 },
  { id: 26, name: 'Water Level Sensor', category: 'sensors', subcategory: 'level', price: 200, oldPrice: null, desc: 'Measures water depth. For water tank monitoring and flood detection.', icon: 'Waves', badge: null, stock: 35 },
  { id: 27, name: 'Rain Sensor Module', category: 'sensors', subcategory: 'weather', price: 220, oldPrice: null, desc: 'Detects rain/water droplets. For weather stations and smart windows.', icon: 'CloudRain', badge: null, stock: 30 },
  { id: 28, name: 'Load Cell + HX711 Module', category: 'sensors', subcategory: 'weight', price: 800, oldPrice: null, desc: '5kg weight sensor with 24-bit ADC module. For weighing scale projects.', icon: 'Scale', badge: null, stock: 20 },
  { id: 29, name: 'Color Sensor (TCS3200)', category: 'sensors', subcategory: 'color', price: 550, oldPrice: null, desc: 'Detects color and light intensity. For color sorting robot projects.', icon: 'Palette', badge: null, stock: 15 },
  { id: 30, name: 'Flex Sensor 2.2"', category: 'sensors', subcategory: 'bend', price: 500, oldPrice: null, desc: 'Measures bending/flexing. For gesture control and robotic hand projects.', icon: 'Hand', badge: null, stock: 15 },

  // Passive Components
  { id: 31, name: 'Resistor Kit (400 pcs, 20 values)', category: 'passive', subcategory: 'resistors', price: 600, oldPrice: null, desc: '10 Ohm - 1 MOhm, 1/4W, 5% carbon film. Essential for every lab kit.', icon: 'Zap', badge: null, stock: 100 },
  { id: 32, name: 'Electrolytic Capacitor Kit (120 pcs)', category: 'passive', subcategory: 'capacitors', price: 550, oldPrice: null, desc: '12 values x 10 pcs: 0.1uF to 1000uF. 16V-50V rated.', icon: 'Battery', badge: null, stock: 80 },
  { id: 33, name: 'Ceramic Capacitor Kit (300 pcs)', category: 'passive', subcategory: 'capacitors', price: 400, oldPrice: null, desc: '30 values x 10 pcs. 50V rated. For decoupling and timing circuits.', icon: 'Battery', badge: null, stock: 70 },
  { id: 34, name: 'Potentiometer Kit (10 pcs)', category: 'passive', subcategory: 'potentiometers', price: 350, oldPrice: null, desc: 'Assorted values: 1K, 5K, 10K, 50K, 100K. Linear and log types.', icon: 'Sliders', badge: null, stock: 60 },
  { id: 35, name: 'Trim Potentiometer Kit (25 pcs)', category: 'passive', subcategory: 'potentiometers', price: 300, oldPrice: null, desc: 'RM-065 multi-turn trim pots. 5 values x 5 pcs. For calibration circuits.', icon: 'SlidersHorizontal', badge: null, stock: 50 },
  { id: 36, name: 'Inductor Kit (120 pcs)', category: 'passive', subcategory: 'inductors', price: 500, oldPrice: null, desc: '12 values: 1uH to 1mH. For filter and oscillator circuits.', icon: 'Zap', badge: null, stock: 40 },
  { id: 37, name: 'Crystal Oscillator Kit (15 pcs)', category: 'passive', subcategory: 'crystals', price: 450, oldPrice: null, desc: 'Common values: 4MHz, 8MHz, 12MHz, 16MHz. For clock circuits.', icon: 'Timer', badge: null, stock: 40 },
  { id: 38, name: 'Push Button Switch (20 pcs)', category: 'passive', subcategory: 'switches', price: 250, oldPrice: null, desc: '6x6x5mm tactile switches. For user input and control panels.', icon: 'ToggleLeft', badge: null, stock: 100 },
  { id: 39, name: 'Slide Switch (10 pcs)', category: 'passive', subcategory: 'switches', price: 200, oldPrice: null, desc: 'SS12D00G3 SPDT slide switches. For mode selection circuits.', icon: 'ToggleRight', badge: null, stock: 60 },
  { id: 40, name: 'DIP Switch (10 pcs)', category: 'passive', subcategory: 'switches', price: 250, oldPrice: null, desc: '4-position and 8-position. For address/configuration setting.', icon: 'Grid3x3', badge: null, stock: 40 },
  { id: 41, name: 'Relay Module 5V (1-Channel)', category: 'passive', subcategory: 'relays', price: 300, oldPrice: null, desc: '5V SPDT relay with optocoupler isolation. For switching AC/DC loads.', icon: 'Power', badge: null, stock: 50 },
  { id: 42, name: 'Relay Module 5V (4-Channel)', category: 'passive', subcategory: 'relays', price: 800, oldPrice: null, desc: '4-channel relay module with indicator LEDs. For home automation.', icon: 'Power', badge: null, stock: 30 },
  { id: 43, name: 'Piezo Buzzer (10 pcs)', category: 'passive', subcategory: 'audio', price: 300, oldPrice: null, desc: 'Active 5V buzzers. For alarms, notifications, and audio feedback.', icon: 'Volume2', badge: null, stock: 80 },
  { id: 44, name: 'Speaker 0.5W 8 Ohm', category: 'passive', subcategory: 'audio', price: 200, oldPrice: null, desc: 'Small speaker for audio output projects. Works with amplifier modules.', icon: 'Volume2', badge: null, stock: 50 },

  // Active Components
  { id: 45, name: 'Transistor Kit (200 pcs)', category: 'active', subcategory: 'transistors', price: 800, oldPrice: null, desc: 'BC547, BC557, 2N2222, 2N3904, 2N3906 & more. NPN and PNP.', icon: 'GitBranch', badge: null, stock: 50 },
  { id: 46, name: 'Diode Kit (100 pcs)', category: 'active', subcategory: 'diodes', price: 400, oldPrice: null, desc: '1N4148, 1N4001-1N4007, LED diodes. For rectifier and protection circuits.', icon: 'ArrowRight', badge: null, stock: 60 },
  { id: 47, name: 'Voltage Regulator Kit (10 pcs)', category: 'active', subcategory: 'regulators', price: 450, oldPrice: null, desc: 'LM7805, LM7809, LM7812, LM317, LM2596. For power supply projects.', icon: 'BatteryCharging', badge: null, stock: 40 },
  { id: 48, name: 'Op-Amp IC Kit (10 pcs)', category: 'active', subcategory: 'ics', price: 600, oldPrice: null, desc: 'LM358, LM324, LM741, TL072. For amplifier and filter circuits.', icon: 'Triangle', badge: null, stock: 35 },
  { id: 49, name: '555 Timer IC (10 pcs)', category: 'active', subcategory: 'ics', price: 350, oldPrice: null, desc: 'NE555P precision timer. For oscillators, timers, and PWM generation.', icon: 'Clock', badge: null, stock: 70 },
  { id: 50, name: 'Logic Gate IC Kit (15 pcs)', category: 'active', subcategory: 'ics', price: 700, oldPrice: null, desc: '74HC00, 74HC04, 74HC08, 74HC32, 74HC86. NAND, NOT, AND, OR, XOR.', icon: 'Grid2x2', badge: null, stock: 30 },
  { id: 51, name: 'Shift Register 74HC595 (10 pcs)', category: 'active', subcategory: 'ics', price: 400, oldPrice: null, desc: '8-bit serial-in parallel-out. For expanding digital outputs.', icon: 'ArrowRightLeft', badge: null, stock: 45 },
  { id: 52, name: 'Darlington Array ULN2003 (5 pcs)', category: 'active', subcategory: 'ics', price: 350, oldPrice: null, desc: '7-channel high-voltage, high-current driver. For relay and motor control.', icon: 'ArrowUpRight', badge: null, stock: 40 },
  { id: 53, name: 'MOSFET Kit (20 pcs)', category: 'active', subcategory: 'transistors', price: 550, oldPrice: null, desc: 'IRFZ44N, IRF540N, 2N7000. For high-power switching applications.', icon: 'GitBranch', badge: null, stock: 35 },
  { id: 54, name: 'Bridge Rectifier (10 pcs)', category: 'active', subcategory: 'diodes', price: 300, oldPrice: null, desc: 'KBPC5010, W10. For AC to DC power supply conversion.', icon: 'ArrowDownUp', badge: null, stock: 40 },
  { id: 55, name: 'Variable Voltage Regulator LM317', category: 'active', subcategory: 'regulators', price: 250, oldPrice: null, desc: 'Adjustable 1.2V to 37V output. For custom power supply design.', icon: 'BatteryCharging', badge: null, stock: 50 },
  { id: 56, name: 'Switching Regulator LM2596 Module', category: 'active', subcategory: 'regulators', price: 350, oldPrice: null, desc: 'DC-DC buck converter, adjustable 1.25V-35V, 3A max. High efficiency.', icon: 'BatteryCharging', badge: null, stock: 45 },

  // Power Supplies
  { id: 57, name: '5V 2A Power Supply Adapter', category: 'power', subcategory: 'adapters', price: 500, oldPrice: null, desc: 'Universal AC-DC adapter with multiple DC tips. For Arduino and breadboard.', icon: 'Plug', badge: null, stock: 60 },
  { id: 58, name: '12V 5A Power Supply', category: 'power', subcategory: 'adapters', price: 1200, oldPrice: null, desc: 'Reliable 12V DC power supply. For motors, LED strips, and amplifiers.', icon: 'Plug', badge: null, stock: 30 },
  { id: 59, name: 'Breadboard Power Supply Module', category: 'power', subcategory: 'modules', price: 350, oldPrice: null, desc: '3.3V/5V dual output, fits on breadboard. USB or barrel jack input.', icon: 'Battery', badge: null, stock: 55 },
  { id: 60, name: '18650 Battery Holder (2-cell)', category: 'power', subcategory: 'batteries', price: 250, oldPrice: null, desc: 'Series connection, 7.4V output. For portable projects.', icon: 'Battery', badge: null, stock: 40 },
  { id: 61, name: '18650 Li-Ion Battery (3000mAh)', category: 'power', subcategory: 'batteries', price: 600, oldPrice: null, desc: 'Rechargeable 3.7V lithium-ion cell. High capacity for portable builds.', icon: 'Battery', badge: null, stock: 35 },
  { id: 62, name: 'TP4056 Charging Module', category: 'power', subcategory: 'modules', price: 200, oldPrice: null, desc: 'Li-Ion battery charger with protection. USB input, 1A charge current.', icon: 'BatteryCharging', badge: null, stock: 50 },
  { id: 63, name: 'Solar Panel 6V 1W', category: 'power', subcategory: 'solar', price: 500, oldPrice: null, desc: 'Polycrystalline solar cell. For solar-powered project experiments.', icon: 'Sun', badge: null, stock: 25 },
  { id: 64, name: 'USB Power Bank 10000mAh', category: 'power', subcategory: 'banks', price: 2500, oldPrice: null, desc: 'Portable power for outdoor and field projects. Dual USB output.', icon: 'BatteryFull', badge: null, stock: 15 },
  { id: 65, name: '9V Battery Snap Connector (5 pcs)', category: 'power', subcategory: 'connectors', price: 150, oldPrice: null, desc: 'T-type connector for 9V batteries. With leads for breadboard connection.', icon: 'Battery', badge: null, stock: 80 },
  { id: 66, name: 'DC Barrel Jack Adapter (5 pcs)', category: 'power', subcategory: 'connectors', price: 200, oldPrice: null, desc: '5.5x2.1mm barrel jack with screw terminals. For easy power connection.', icon: 'Plug', badge: null, stock: 60 },

  // Tools & Equipment
  { id: 67, name: 'Digital Multimeter DT-830B', category: 'tools', subcategory: 'meters', price: 1200, oldPrice: 1500, desc: 'AC/DC voltage, current, resistance, diode test, continuity buzzer.', icon: 'Gauge', badge: 'sale', stock: 40 },
  { id: 68, name: 'Digital Multimeter (Auto-ranging)', category: 'tools', subcategory: 'meters', price: 2500, oldPrice: null, desc: 'Professional auto-ranging multimeter with backlight and hold function.', icon: 'Gauge', badge: null, stock: 20 },
  { id: 69, name: 'Soldering Iron Kit 60W', category: 'tools', subcategory: 'soldering', price: 1800, oldPrice: null, desc: 'Adjustable temperature 200-450C with stand, solder wire, desoldering pump.', icon: 'Flame', badge: null, stock: 25 },
  { id: 70, name: 'Solder Wire 60/40 (50g)', category: 'tools', subcategory: 'soldering', price: 400, oldPrice: null, desc: '0.8mm diameter, flux core. For PCB soldering and repairs.', icon: 'PenTool', badge: null, stock: 50 },
  { id: 71, name: 'Desoldering Pump', category: 'tools', subcategory: 'soldering', price: 350, oldPrice: null, desc: 'Manual solder sucker for component removal and rework.', icon: 'ArrowDown', badge: null, stock: 30 },
  { id: 72, name: 'Soldering Helping Hands', category: 'tools', subcategory: 'soldering', price: 800, oldPrice: null, desc: 'Third hand with magnifying glass and alligator clips. Essential for PCB work.', icon: 'Grab', badge: null, stock: 20 },
  { id: 73, name: 'Solderless Breadboard (830 points)', category: 'tools', subcategory: 'breadboards', price: 450, oldPrice: null, desc: 'Standard half-size breadboard with adhesive backing. For prototyping.', icon: 'LayoutGrid', badge: null, stock: 80 },
  { id: 74, name: 'Solderless Breadboard (4-in-1)', category: 'tools', subcategory: 'breadboards', price: 1200, oldPrice: null, desc: '3220 points, 4 interconnected breadboards. For large projects.', icon: 'LayoutGrid', badge: null, stock: 25 },
  { id: 75, name: 'Male-to-Male Jumper Wires (40 pcs)', category: 'tools', subcategory: 'wires', price: 350, oldPrice: null, desc: '20cm assorted colors. For breadboard connections.', icon: 'Cable', badge: null, stock: 100 },
  { id: 76, name: 'Male-to-Female Jumper Wires (40 pcs)', category: 'tools', subcategory: 'wires', price: 400, oldPrice: null, desc: '20cm assorted colors. For sensor-to-Arduino connections.', icon: 'Cable', badge: null, stock: 80 },
  { id: 77, name: 'Dupont Wire Kit (120 pcs)', category: 'tools', subcategory: 'wires', price: 600, oldPrice: null, desc: 'M-M, M-F, F-F in various lengths. Complete connection kit.', icon: 'Cable', badge: null, stock: 50 },
  { id: 78, name: 'Wire Stripper/Cutter', category: 'tools', subcategory: 'hand-tools', price: 600, oldPrice: null, desc: 'Automatic wire stripper for 10-24 AWG. Built-in cutter.', icon: 'Scissors', badge: null, stock: 25 },
  { id: 79, name: 'Precision Screwdriver Set', category: 'tools', subcategory: 'hand-tools', price: 700, oldPrice: null, desc: '25-in-1 magnetic screwdriver set. For electronics repair and assembly.', icon: 'Wrench', badge: null, stock: 20 },
  { id: 80, name: 'PCB Prototyping Board (5x7cm)', category: 'tools', subcategory: 'pcb', price: 150, oldPrice: null, desc: 'Single-sided copper clad board. For custom circuit fabrication.', icon: 'Square', badge: null, stock: 60 },
  { id: 81, name: 'PCB Prototyping Board Kit (10 pcs)', category: 'tools', subcategory: 'pcb', price: 800, oldPrice: null, desc: 'Assorted sizes: 2x8, 3x7, 4x6, 5x7, 7x9 cm. For permanent circuits.', icon: 'Square', badge: null, stock: 35 },
  { id: 82, name: 'Bench Power Supply (0-30V, 0-5A)', category: 'tools', subcategory: 'power-supplies', price: 8500, oldPrice: null, desc: 'Variable DC power supply with digital display. For lab and testing.', icon: 'BatteryCharging', badge: null, stock: 8 },

  // Cables & Connectors
  { id: 83, name: 'USB Type-A to Type-B Cable (1.5m)', category: 'cables', subcategory: 'usb', price: 350, oldPrice: null, desc: 'Standard Arduino programming cable. High quality copper conductors.', icon: 'Cable', badge: null, stock: 80 },
  { id: 84, name: 'USB Type-C Cable (1m)', category: 'cables', subcategory: 'usb', price: 300, oldPrice: null, desc: 'Fast charging and data. For modern boards and devices.', icon: 'Cable', badge: null, stock: 60 },
  { id: 85, name: 'Micro USB Cable (1m)', category: 'cables', subcategory: 'usb', price: 250, oldPrice: null, desc: 'For NodeMCU, ESP8266, Raspberry Pi Zero, and Android devices.', icon: 'Cable', badge: null, stock: 70 },
  { id: 86, name: 'Female Header Strip (40-pin)', category: 'cables', subcategory: 'headers', price: 100, oldPrice: null, desc: '2.54mm pitch breakaway header. For custom PCB and shields.', icon: 'Hash', badge: null, stock: 100 },
  { id: 87, name: 'Male Header Strip (40-pin)', category: 'cables', subcategory: 'headers', price: 80, oldPrice: null, desc: '2.54mm pitch breakaway header. For modules and breakout boards.', icon: 'Hash', badge: null, stock: 100 },
  { id: 88, name: 'JST Connector Kit (10 sets)', category: 'cables', subcategory: 'connectors', price: 400, oldPrice: null, desc: '2-pin and 3-pin JST-XH connectors with housings and crimps.', icon: 'Cable', badge: null, stock: 40 },
  { id: 89, name: 'Terminal Block (10 pcs)', category: 'cables', subcategory: 'connectors', price: 350, oldPrice: null, desc: '2-pin and 3-pin screw terminals. 5mm pitch. For secure wiring.', icon: 'Cable', badge: null, stock: 50 },
  { id: 90, name: 'Alligator Clip Wires (10 pcs)', category: 'cables', subcategory: 'test', price: 300, oldPrice: null, desc: '50cm double-ended alligator clips. Assorted colors. For test connections.', icon: 'Cable', badge: null, stock: 40 },
  { id: 91, name: 'HDMI Cable (1.5m)', category: 'cables', subcategory: 'av', price: 500, oldPrice: null, desc: 'High-speed HDMI for Raspberry Pi displays. Supports 1080p.', icon: 'Cable', badge: null, stock: 25 },
  { id: 92, name: 'Ethernet Cable (Cat5e, 2m)', category: 'cables', subcategory: 'network', price: 400, oldPrice: null, desc: 'Patch cable for network projects and wired IoT setups.', icon: 'Cable', badge: null, stock: 30 },

  // Displays & LEDs
  { id: 93, name: 'LCD 16x2 Display (I2C)', category: 'displays', subcategory: 'lcd', price: 650, oldPrice: null, desc: 'HD44780 character LCD with I2C backpack. 2 lines x 16 characters.', icon: 'Monitor', badge: null, stock: 45 },
  { id: 94, name: 'LCD 20x4 Display (I2C)', category: 'displays', subcategory: 'lcd', price: 900, oldPrice: null, desc: 'Large character LCD with I2C backpack. 4 lines x 20 characters.', icon: 'Monitor', badge: null, stock: 30 },
  { id: 95, name: 'OLED Display 0.96" (I2C)', category: 'displays', subcategory: 'oled', price: 550, oldPrice: null, desc: '128x64 monochrome OLED. High contrast, low power. For compact projects.', icon: 'Monitor', badge: null, stock: 40 },
  { id: 96, name: 'OLED Display 1.3" (I2C)', category: 'displays', subcategory: 'oled', price: 750, oldPrice: null, desc: '128x64 SH1106 driver. Larger display for better readability.', icon: 'Monitor', badge: null, stock: 25 },
  { id: 97, name: '7-Segment Display (4-digit, TM1637)', category: 'displays', subcategory: '7segment', price: 300, oldPrice: null, desc: 'Common cathode with driver IC. For clocks, counters, numeric displays.', icon: 'Binary', badge: null, stock: 50 },
  { id: 98, name: 'WS2812B LED Strip (1m, 60 LEDs)', category: 'displays', subcategory: 'led-strips', price: 800, oldPrice: null, desc: 'Addressable RGB LED strip. 5V, individually controllable. For lighting effects.', icon: 'Lightbulb', badge: null, stock: 25 },
  { id: 99, name: 'RGB LED Module (KY-016)', category: 'displays', subcategory: 'leds', price: 150, oldPrice: null, desc: 'Common cathode RGB LED with current limiting resistors. For color mixing.', icon: 'Lightbulb', badge: null, stock: 80 },
  { id: 100, name: 'LED Assortment Kit (100 pcs)', category: 'displays', subcategory: 'leds', price: 400, oldPrice: null, desc: '5mm and 3mm in red, green, blue, yellow, white. With resistors.', icon: 'Lightbulb', badge: null, stock: 60 },
  { id: 101, name: '8x8 LED Matrix (MAX7219)', category: 'displays', subcategory: 'matrix', price: 450, oldPrice: null, desc: '64 LED dot matrix with driver IC. For scrolling text and animations.', icon: 'Grid3x3', badge: null, stock: 30 },
  { id: 102, name: 'TFT LCD 2.4" Touch Screen', category: 'displays', subcategory: 'tft', price: 2500, oldPrice: null, desc: '240x320 ILI9341 with touch and SD card. For advanced GUIs.', icon: 'Monitor', badge: null, stock: 10 },
  { id: 103, name: 'Neopixel Ring (16 LEDs)', category: 'displays', subcategory: 'led-strips', price: 1200, oldPrice: null, desc: 'Circular addressable RGB LEDs. For gauges, indicators, decorative lighting.', icon: 'CircleDot', badge: null, stock: 15 },

  // IoT & Wireless
  { id: 104, name: 'HC-05 Bluetooth Module', category: 'wireless', subcategory: 'bluetooth', price: 600, oldPrice: null, desc: 'Bluetooth 2.0 serial module. For wireless communication with phones.', icon: 'Bluetooth', badge: null, stock: 35 },
  { id: 105, name: 'HC-06 Bluetooth Module', category: 'wireless', subcategory: 'bluetooth', price: 500, oldPrice: null, desc: 'Slave-only Bluetooth module. Simpler alternative to HC-05.', icon: 'Bluetooth', badge: null, stock: 30 },
  { id: 106, name: 'NRF24L01+ Wireless Module', category: 'wireless', subcategory: 'rf', price: 350, oldPrice: null, desc: '2.4GHz transceiver. For wireless sensor networks and remote control.', icon: 'Radio', badge: null, stock: 40 },
  { id: 107, name: 'SIM800L GSM Module', category: 'wireless', subcategory: 'gsm', price: 1200, oldPrice: null, desc: 'Quad-band GSM/GPRS module. For SMS, calls, and IoT connectivity.', icon: 'Smartphone', badge: null, stock: 20 },
  { id: 108, name: 'RFID Kit (RC522 + Cards + Tags)', category: 'wireless', subcategory: 'rfid', price: 800, oldPrice: null, desc: '13.56MHz RFID reader with MIFARE cards and key fobs. For access control.', icon: 'CreditCard', badge: null, stock: 25 },
  { id: 109, name: 'RF Transmitter + Receiver (433MHz)', category: 'wireless', subcategory: 'rf', price: 350, oldPrice: null, desc: 'ASK wireless pair. For simple remote control applications.', icon: 'Radio', badge: null, stock: 35 },
  { id: 110, name: 'GPS Module (NEO-6M)', category: 'wireless', subcategory: 'gps', price: 1500, oldPrice: null, desc: 'UART GPS receiver with antenna. For location tracking projects.', icon: 'MapPin', badge: null, stock: 15 },
  { id: 111, name: 'Ethernet Module (ENC28J60)', category: 'wireless', subcategory: 'ethernet', price: 800, oldPrice: null, desc: 'SPI Ethernet controller. For wired network connectivity on Arduino.', icon: 'Globe', badge: null, stock: 15 },
  { id: 112, name: 'WiFi Relay Module (ESP-01)', category: 'wireless', subcategory: 'wifi', price: 700, oldPrice: null, desc: 'ESP8266-based WiFi relay board. For IoT home automation.', icon: 'Wifi', badge: null, stock: 20 },

  // Motors & Drivers
  { id: 113, name: 'L298N Motor Driver Module', category: 'motors', subcategory: 'drivers', price: 550, oldPrice: null, desc: 'Dual H-bridge. Controls 2 DC motors or 1 stepper. Up to 2A per channel.', icon: 'Cog', badge: null, stock: 40 },
  { id: 114, name: 'L293D Motor Driver Shield', category: 'motors', subcategory: 'drivers', price: 600, oldPrice: null, desc: 'Arduino shield with 4-channel motor driver. Plug and play.', icon: 'Cog', badge: null, stock: 25 },
  { id: 115, name: 'DRV8833 Motor Driver Module', category: 'motors', subcategory: 'drivers', price: 400, oldPrice: null, desc: 'Compact dual motor driver. 1.2A per channel. For small robots.', icon: 'Cog', badge: null, stock: 30 },
  { id: 116, name: 'DC Motor (3-6V) with Gearbox', category: 'motors', subcategory: 'dc', price: 300, oldPrice: null, desc: 'TT motor with reduction gearbox. High torque for robot cars.', icon: 'Cog', badge: null, stock: 50 },
  { id: 117, name: 'DC Motor (3-6V) Twin Pack', category: 'motors', subcategory: 'dc', price: 500, oldPrice: null, desc: 'Two TT motors with wheels. For 2WD robot car projects.', icon: 'Cog', badge: null, stock: 40 },
  { id: 118, name: 'Servo Motor SG90 (Tower Pro)', category: 'motors', subcategory: 'servo', price: 350, oldPrice: null, desc: '9g micro servo, 180-degree rotation. For robotic arms and steering.', icon: 'RotateCw', badge: null, stock: 60 },
  { id: 119, name: 'Servo Motor MG995 (Metal Gear)', category: 'motors', subcategory: 'servo', price: 800, oldPrice: null, desc: 'High torque metal gear servo. For heavy-duty robotic applications.', icon: 'RotateCw', badge: null, stock: 25 },
  { id: 120, name: '28BYJ-48 Stepper Motor + ULN2003', category: 'motors', subcategory: 'stepper', price: 500, oldPrice: null, desc: '5V stepper with driver board. For precise positioning projects.', icon: 'Cog', badge: null, stock: 30 },
  { id: 121, name: 'NEMA 17 Stepper Motor', category: 'motors', subcategory: 'stepper', price: 2500, oldPrice: null, desc: '1.8-degree bipolar stepper, 4.2kg-cm torque. For CNC and 3D printers.', icon: 'Cog', badge: null, stock: 10 },
  { id: 122, name: 'A4988 Stepper Motor Driver', category: 'motors', subcategory: 'drivers', price: 450, oldPrice: null, desc: 'Microstepping driver for bipolar steppers. Current limiting pot.', icon: 'Cog', badge: null, stock: 25 },
  { id: 123, name: 'Robot Car Chassis Kit (2WD)', category: 'motors', subcategory: 'chassis', price: 1500, oldPrice: null, desc: ' Acrylic chassis with motors, wheels, caster, and battery holder.', icon: 'Car', badge: null, stock: 20 },
  { id: 124, name: 'Robot Car Chassis Kit (4WD)', category: 'motors', subcategory: 'chassis', price: 2500, oldPrice: null, desc: 'Metal chassis with 4 motors and off-road wheels. For rugged robots.', icon: 'Car', badge: null, stock: 12 },

  // Additional Tools
  { id: 125, name: 'Logic Analyzer (8-channel, USB)', category: 'tools', subcategory: 'test', price: 3500, oldPrice: null, desc: '24MHz 8-channel logic analyzer. For debugging digital signals.', icon: 'Activity', badge: null, stock: 8 },
  { id: 126, name: 'Oscilloscope DIY Kit (DSO138)', category: 'tools', subcategory: 'test', price: 4500, oldPrice: null, desc: ' Assembled 2.4" TFT digital oscilloscope. 0-200kHz bandwidth.', icon: 'Waves', badge: null, stock: 10 },
  { id: 127, name: 'Function Generator Module', category: 'tools', subcategory: 'test', price: 2800, oldPrice: null, desc: 'AD9833 DDS signal generator. Sine, square, triangle waves.', icon: 'Waveform', badge: null, stock: 8 },
  { id: 128, name: 'Heat Gun (Hot Air Rework)', category: 'tools', subcategory: 'soldering', price: 3500, oldPrice: null, desc: '858D+ hot air rework station. For SMD soldering and desoldering.', icon: 'Wind', badge: null, stock: 6 },
  { id: 129, name: 'Soldering Iron Tip Set (10 pcs)', category: 'tools', subcategory: 'soldering', price: 600, oldPrice: null, desc: ' assorted tip shapes for different soldering tasks.', icon: 'Flame', badge: null, stock: 20 },
  { id: 130, name: 'Solder Paste (Sn63/Pb37, 50g)', category: 'tools', subcategory: 'soldering', price: 800, oldPrice: null, desc: 'For SMD reflow soldering. Includes syringe applicator.', icon: 'Container', badge: null, stock: 15 },
  { id: 131, name: 'SMD Component Kit (1000 pcs)', category: 'passive', subcategory: 'smd', price: 2500, oldPrice: null, desc: '0402/0603/0805 resistors and capacitors in organizer box.', icon: 'Box', badge: null, stock: 12 },
  { id: 132, name: 'IC Extractor Tool', category: 'tools', subcategory: 'hand-tools', price: 350, oldPrice: null, desc: 'For safely removing DIP ICs from sockets and breadboards.', icon: 'ArrowUp', badge: null, stock: 25 },
  { id: 133, name: 'Anti-static Wrist Strap', category: 'tools', subcategory: 'safety', price: 400, oldPrice: null, desc: 'Grounded wrist strap for ESD protection. Essential for IC handling.', icon: 'Shield', badge: null, stock: 30 },
  { id: 134, name: 'Component Storage Box (24 grids)', category: 'tools', subcategory: 'storage', price: 800, oldPrice: null, desc: 'Adjustable dividers, transparent lid. For organizing components.', icon: 'LayoutGrid', badge: null, stock: 20 },
  { id: 135, name: 'Resistor Color Code Calculator', category: 'tools', subcategory: 'accessories', price: 500, oldPrice: null, desc: 'Pocket-sized plastic calculator card. Quick reference for lab work.', icon: 'Calculator', badge: null, stock: 30 },
  { id: 136, name: 'Mini Breadboard (170 points, 6 pack)', category: 'tools', subcategory: 'breadboards', price: 500, oldPrice: null, desc: 'Tiny breadboards for small circuits. Assorted colors.', icon: 'LayoutGrid', badge: null, stock: 40 },
  { id: 137, name: 'Banana Plug Test Leads (4 pcs)', category: 'cables', subcategory: 'test', price: 600, oldPrice: null, desc: 'For multimeter and power supply connections. Stackable plugs.', icon: 'Cable', badge: null, stock: 20 },
  { id: 138, name: 'Pin Header Assortment Box', category: 'cables', subcategory: 'headers', price: 1000, oldPrice: null, desc: 'M/M, M/F, F/F headers in various lengths. Organizer included.', icon: 'Container', badge: null, stock: 15 },
  { id: 139, name: '9V Alkaline Battery (Energizer)', category: 'power', subcategory: 'batteries', price: 350, oldPrice: null, desc: 'Long-lasting alkaline battery. For small projects and multimeters.', icon: 'Battery', badge: null, stock: 50 },
  { id: 140, name: 'AA Battery Holder (4-cell)', category: 'power', subcategory: 'batteries', price: 200, oldPrice: null, desc: 'Holds 4 AA batteries, 6V output. With leads and switch.', icon: 'Battery', badge: null, stock: 40 },
];
