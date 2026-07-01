export interface ProjectComponent {
  productId: number;
  label: string;
  quantity: number;
}

export interface ProjectStep {
  title: string;
  description: string;
  code?: string;
}

export interface ProjectGuide {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  course: string;
  components: ProjectComponent[];
  steps: ProjectStep[];
  diagramType: string;
  icon: string;
}

export const projectGuides: ProjectGuide[] = [
  {
    id: 'arduino-blink',
    title: 'Arduino LED Blink',
    shortTitle: 'LED Blink',
    description: 'The classic first Arduino project. Learn how to control a digital output pin to blink an LED. This project teaches the basics of the Arduino IDE, pinMode(), digitalWrite(), and delay() functions.',
    difficulty: 'Beginner',
    duration: '15 min',
    course: 'Introduction to Microcontrollers',
    icon: 'Lightbulb',
    diagramType: 'blink',
    components: [
      { productId: 1, label: 'Arduino Uno R3', quantity: 1 },
      { productId: 100, label: 'LED (5mm)', quantity: 1 },
      { productId: 31, label: 'Resistor (220Ω)', quantity: 1 },
      { productId: 73, label: 'Breadboard', quantity: 1 },
      { productId: 75, label: 'Jumper Wires', quantity: 2 },
    ],
    steps: [
      { title: 'Set up your circuit', description: 'Place the LED on the breadboard. Connect the longer leg (anode) to Arduino pin 13 through a 220Ω resistor. Connect the shorter leg (cathode) to GND.' },
      { title: 'Connect Arduino', description: 'Connect your Arduino Uno to your computer using the USB cable.' },
      { title: 'Open Arduino IDE', description: 'Open the Arduino IDE. Go to File > Examples > 01.Basics > Blink to load the example sketch.' },
      { title: 'Upload the code', description: 'Select your board (Tools > Board > Arduino Uno) and port, then click Upload. The LED should start blinking!' },
    ],
  },
  {
    id: 'temperature-monitor',
    title: 'Temperature & Humidity Monitor',
    shortTitle: 'Temp Monitor',
    description: 'Build a digital thermometer and hygrometer using the DHT22 sensor and display readings on a 16x2 LCD. Perfect for environmental monitoring projects in your coursework.',
    difficulty: 'Beginner',
    duration: '30 min',
    course: 'Sensors & Instrumentation',
    icon: 'Thermometer',
    diagramType: 'dht22-lcd',
    components: [
      { productId: 1, label: 'Arduino Uno R3', quantity: 1 },
      { productId: 13, label: 'DHT22 Sensor', quantity: 1 },
      { productId: 93, label: 'LCD 16x2 (I2C)', quantity: 1 },
      { productId: 73, label: 'Breadboard', quantity: 1 },
      { productId: 75, label: 'Jumper Wires', quantity: 8 },
      { productId: 31, label: 'Resistor (10KΩ)', quantity: 1 },
    ],
    steps: [
      { title: 'Install libraries', description: 'Install the "DHT sensor library" and "LiquidCrystal I2C" library via Sketch > Include Library > Manage Libraries.' },
      { title: 'Connect DHT22', description: 'Connect DHT22 VCC to 5V, GND to GND, and DATA pin to Arduino digital pin 2. Add a 10KΩ pull-up resistor between VCC and DATA.' },
      { title: 'Connect LCD', description: 'Connect LCD VCC to 5V, GND to GND, SDA to A4, and SCL to A5.' },
      { title: 'Upload code', description: 'Write a sketch that reads temperature and humidity from DHT22 and displays values on the LCD. Upload and verify readings.', code: '#include "DHT.h"\n#include <LiquidCrystal_I2C.h>\n\n#define DHTPIN 2\n#define DHTTYPE DHT22\nDHT dht(DHTPIN, DHTTYPE);\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nvoid setup() {\n  dht.begin();\n  lcd.init();\n  lcd.backlight();\n}\n\nvoid loop() {\n  float t = dht.readTemperature();\n  float h = dht.readHumidity();\n  lcd.setCursor(0,0);\n  lcd.print("Temp: " + String(t) + "C ");\n  lcd.setCursor(0,1);\n  lcd.print("Hum:  " + String(h) + "% ");\n  delay(2000);\n}' },
    ],
  },
  {
    id: 'ultrasonic-distance',
    title: 'Ultrasonic Distance Meter',
    shortTitle: 'Distance Meter',
    description: 'Create a distance measuring device using the HC-SR04 ultrasonic sensor. Display distance on a 7-segment display or serial monitor. Great for learning pulse timing and distance calculation.',
    difficulty: 'Beginner',
    duration: '30 min',
    course: 'Measurement & Control',
    icon: 'Ruler',
    diagramType: 'ultrasonic',
    components: [
      { productId: 1, label: 'Arduino Uno R3', quantity: 1 },
      { productId: 15, label: 'HC-SR04 Sensor', quantity: 1 },
      { productId: 97, label: '7-Segment Display', quantity: 1 },
      { productId: 73, label: 'Breadboard', quantity: 1 },
      { productId: 75, label: 'Jumper Wires', quantity: 10 },
    ],
    steps: [
      { title: 'Connect HC-SR04', description: 'VCC to 5V, GND to GND, Trig to pin 9, Echo to pin 10.' },
      { title: 'Connect 7-segment display', description: 'Connect CLK to pin 11 and DIO to pin 12 of the TM1637 display module.' },
      { title: 'Upload code', description: 'The sketch sends a trigger pulse, measures echo duration, calculates distance = duration * 0.034 / 2, and displays it in cm.', code: '#include <TM1637Display.h>\n\n#define TRIG 9\n#define ECHO 10\n#define CLK 11\n#define DIO 12\nTM1637Display display(CLK, DIO);\n\nvoid setup() {\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  display.setBrightness(7);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  long duration = pulseIn(ECHO, HIGH);\n  int distance = duration * 0.034 / 2;\n  display.showNumberDec(distance);\n  Serial.println(String(distance) + " cm");\n  delay(500);\n}' },
    ],
  },
  {
    id: 'motion-detector',
    title: 'Smart Home Motion Detector',
    shortTitle: 'Motion Detector',
    description: 'Build a motion-activated security system using a PIR sensor. When motion is detected, an LED turns on and a buzzer sounds. This teaches digital input handling and conditional logic.',
    difficulty: 'Intermediate',
    duration: '1 hour',
    course: 'Digital Electronics',
    icon: 'Eye',
    diagramType: 'pir-alarm',
    components: [
      { productId: 1, label: 'Arduino Uno R3', quantity: 1 },
      { productId: 16, label: 'PIR Motion Sensor', quantity: 1 },
      { productId: 100, label: 'LED (Red)', quantity: 1 },
      { productId: 43, label: 'Buzzer Module', quantity: 1 },
      { productId: 31, label: 'Resistor (220Ω)', quantity: 1 },
      { productId: 73, label: 'Breadboard', quantity: 1 },
      { productId: 75, label: 'Jumper Wires', quantity: 8 },
    ],
    steps: [
      { title: 'Connect PIR sensor', description: 'VCC to 5V, GND to GND, OUT to digital pin 2.' },
      { title: 'Connect LED and buzzer', description: 'LED anode to pin 13 via 220Ω resistor, cathode to GND. Buzzer positive to pin 12, negative to GND.' },
      { title: 'Set PIR sensitivity', description: 'Adjust the time delay and sensitivity pots on the PIR module. Set time delay to minimum for quick response.' },
      { title: 'Upload code', description: 'Read PIR output. If HIGH, turn on LED and sound buzzer for 2 seconds. Print "Motion detected!" to serial monitor.' },
    ],
  },
  {
    id: 'line-follower',
    title: 'Line Following Robot',
    shortTitle: 'Line Follower',
    description: 'Build an autonomous robot that follows a black line on a white surface. Uses IR sensors to detect the line and a motor driver to control wheel movement. A classic mechatronics project.',
    difficulty: 'Intermediate',
    duration: '2 hours',
    course: 'Mechatronics & Robotics',
    icon: 'Car',
    diagramType: 'line-follower',
    components: [
      { productId: 1, label: 'Arduino Uno R3', quantity: 1 },
      { productId: 123, label: 'Robot Car Chassis (2WD)', quantity: 1 },
      { productId: 113, label: 'L298N Motor Driver', quantity: 1 },
      { productId: 21, label: 'IR Sensor (TCRT5000)', quantity: 2 },
      { productId: 116, label: 'DC Motors', quantity: 2 },
      { productId: 61, label: '18650 Battery', quantity: 2 },
      { productId: 60, label: 'Battery Holder', quantity: 1 },
      { productId: 75, label: 'Jumper Wires', quantity: 20 },
    ],
    steps: [
      { title: 'Assemble chassis', description: 'Mount the motors on the chassis, attach wheels, and install the caster wheel at the front.' },
      { title: 'Mount Arduino and driver', description: 'Secure the Arduino and L298N motor driver on the chassis using standoffs or double-sided tape.' },
      { title: 'Connect motors to driver', description: 'Connect left motor to OUT1/OUT2 and right motor to OUT3/OUT4 on the L298N.' },
      { title: 'Connect IR sensors', description: 'Mount two IR sensors at the front, facing down. Connect them to digital pins 2 and 3. Left sensor = pin 2, Right sensor = pin 3.' },
      { title: 'Wire motor driver to Arduino', description: 'Connect ENA to pin 5, IN1 to pin 6, IN2 to pin 7, ENB to pin 10, IN3 to pin 8, IN4 to pin 9.' },
      { title: 'Upload code', description: 'Read both sensors. If left sensor on line, turn left. If right sensor on line, turn right. If both on white, go forward. If both on black, stop.', code: '#define ENA 5\n#define IN1 6\n#define IN2 7\n#define ENB 10\n#define IN3 8\n#define IN4 9\n#define LEFT_SENSOR 2\n#define RIGHT_SENSOR 3\n\nvoid setup() {\n  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT);\n  pinMode(IN2, OUTPUT); pinMode(ENB, OUTPUT);\n  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);\n  pinMode(LEFT_SENSOR, INPUT);\n  pinMode(RIGHT_SENSOR, INPUT);\n}\n\nvoid loop() {\n  int left = digitalRead(LEFT_SENSOR);\n  int right = digitalRead(RIGHT_SENSOR);\n  if(left == LOW && right == HIGH) turnLeft();\n  else if(left == HIGH && right == LOW) turnRight();\n  else if(left == HIGH && right == HIGH) stopMotors();\n  else moveForward();\n}\n\nvoid moveForward() {\n  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);\n  analogWrite(ENA, 150); analogWrite(ENB, 150);\n}\nvoid turnLeft() {\n  digitalWrite(IN1, LOW); digitalWrite(IN2, LOW);\n  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);\n  analogWrite(ENA, 0); analogWrite(ENB, 150);\n}\nvoid turnRight() {\n  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n  digitalWrite(IN3, LOW); digitalWrite(IN4, LOW);\n  analogWrite(ENA, 150); analogWrite(ENB, 0);\n}\nvoid stopMotors() {\n  digitalWrite(IN1, LOW); digitalWrite(IN2, LOW);\n  digitalWrite(IN3, LOW); digitalWrite(IN4, LOW);\n}' },
    ],
  },
  {
    id: 'iot-weather-station',
    title: 'IoT Weather Station',
    shortTitle: 'Weather Station',
    description: 'Build a WiFi-connected weather station using ESP32, DHT22, and BMP180 sensors. Data is sent to ThingSpeak or Blynk app for remote monitoring. Covers IoT fundamentals and cloud integration.',
    difficulty: 'Advanced',
    duration: '3 hours',
    course: 'Internet of Things',
    icon: 'Cloud',
    diagramType: 'iot-weather',
    components: [
      { productId: 6, label: 'ESP32 DevKit', quantity: 1 },
      { productId: 13, label: 'DHT22 Sensor', quantity: 1 },
      { productId: 24, label: 'BMP180 Sensor', quantity: 1 },
      { productId: 19, label: 'Rain Sensor', quantity: 1 },
      { productId: 93, label: 'LCD 16x2 (I2C)', quantity: 1 },
      { productId: 63, label: 'Solar Panel 6V', quantity: 1 },
      { productId: 73, label: 'Breadboard', quantity: 1 },
      { productId: 75, label: 'Jumper Wires', quantity: 20 },
    ],
    steps: [
      { title: 'Set up ESP32 in Arduino IDE', description: 'Add ESP32 board support via File > Preferences > Additional Board Manager URLs. Install ESP32 package.' },
      { title: 'Connect sensors', description: 'DHT22 DATA to GPIO4, BMP180 SDA to GPIO21, SCL to GPIO22. Rain sensor AO to GPIO34.' },
      { title: 'Create ThingSpeak channel', description: 'Sign up at thingspeak.com, create a new channel with 4 fields: Temperature, Humidity, Pressure, Rain.' },
      { title: 'Write WiFi + sensor code', description: 'Connect to WiFi, read all sensors, and send data to ThingSpeak using HTTP GET requests every 15 seconds.' },
      { title: 'Add LCD display', description: 'Show current readings on the LCD. Cycle through temperature, humidity, pressure, and rain status.' },
    ],
  },
  {
    id: 'bluetooth-car',
    title: 'Bluetooth Controlled RC Car',
    shortTitle: 'RC Car',
    description: 'Build a smartphone-controlled robot car using HC-05 Bluetooth module and L298N motor driver. Control via a free Bluetooth controller app on Android.',
    difficulty: 'Intermediate',
    duration: '2 hours',
    course: 'Wireless Communication',
    icon: 'Bluetooth',
    diagramType: 'bt-car',
    components: [
      { productId: 1, label: 'Arduino Uno R3', quantity: 1 },
      { productId: 123, label: 'Robot Car Chassis (2WD)', quantity: 1 },
      { productId: 113, label: 'L298N Motor Driver', quantity: 1 },
      { productId: 104, label: 'HC-05 Bluetooth Module', quantity: 1 },
      { productId: 116, label: 'DC Motors', quantity: 2 },
      { productId: 61, label: '18650 Battery', quantity: 2 },
      { productId: 73, label: 'Breadboard', quantity: 1 },
      { productId: 75, label: 'Jumper Wires', quantity: 15 },
    ],
    steps: [
      { title: 'Assemble the chassis', description: 'Mount motors and wheels on the 2WD chassis. Install battery holder.' },
      { title: 'Connect motor driver', description: 'Connect L298N to Arduino: ENA→5, IN1→6, IN2→7, ENB→10, IN3→8, IN4→9.' },
      { title: 'Connect Bluetooth module', description: 'HC-05 VCC to 5V, GND to GND, TX to pin 0 (RX), RX to pin 1 (TX) via voltage divider.' },
      { title: 'Pair with phone', description: 'Power on, pair HC-05 with your Android phone (password: 1234). Install a Bluetooth controller app.' },
      { title: 'Upload code', description: 'Read serial commands from Bluetooth: F=forward, B=backward, L=left, R=right, S=stop. Control motors accordingly.' },
    ],
  },
  {
    id: 'plant-waterer',
    title: 'Automatic Plant Watering System',
    shortTitle: 'Plant Waterer',
    description: 'Create an automated irrigation system that monitors soil moisture and waters plants when dry. Uses a soil moisture sensor, water pump, and relay module.',
    difficulty: 'Intermediate',
    duration: '1.5 hours',
    course: 'Automation & Control',
    icon: 'Droplets',
    diagramType: 'plant-waterer',
    components: [
      { productId: 1, label: 'Arduino Uno R3', quantity: 1 },
      { productId: 20, label: 'Soil Moisture Sensor', quantity: 1 },
      { productId: 42, label: 'Relay Module (1-Channel)', quantity: 1 },
      { productId: 93, label: 'LCD 16x2 (I2C)', quantity: 1 },
      { productId: 57, label: '5V Power Supply', quantity: 1 },
      { productId: 73, label: 'Breadboard', quantity: 1 },
      { productId: 75, label: 'Jumper Wires', quantity: 10 },
    ],
    steps: [
      { title: 'Set up the circuit', description: 'Connect soil moisture sensor AO to A0. Connect relay IN to pin 7. LCD via I2C to A4/A5.' },
      { title: 'Connect the pump', description: 'Connect a small 5V water pump to the relay output. Relay controls pump power.' },
      { title: 'Calibrate sensor', description: 'Place sensor in dry soil, note the reading. Place in wet soil, note reading. Set threshold at midpoint.' },
      { title: 'Upload code', description: 'Read moisture level. If below threshold, turn on relay (pump) for 3 seconds. Display status on LCD.' },
    ],
  },
  {
    id: 'voice-home',
    title: 'Voice Controlled Home Automation',
    shortTitle: 'Voice Control',
    description: 'Control appliances with voice commands using an Android app and Bluetooth. Uses relay modules to switch AC loads safely. Learn about serial communication and relay interfacing.',
    difficulty: 'Advanced',
    duration: '4 hours',
    course: 'Smart Systems',
    icon: 'Mic',
    diagramType: 'voice-home',
    components: [
      { productId: 1, label: 'Arduino Uno R3', quantity: 1 },
      { productId: 104, label: 'HC-05 Bluetooth Module', quantity: 1 },
      { productId: 42, label: 'Relay Module (4-Channel)', quantity: 1 },
      { productId: 93, label: 'LCD 16x2 (I2C)', quantity: 1 },
      { productId: 75, label: 'Jumper Wires', quantity: 20 },
      { productId: 89, label: 'Terminal Blocks', quantity: 5 },
    ],
    steps: [
      { title: 'Wire Bluetooth module', description: 'HC-05 to Arduino: VCC→5V, GND→GND, TX→RX (pin 0), RX→TX (pin 1) via voltage divider.' },
      { title: 'Connect relay module', description: '4-channel relay IN1-IN4 to Arduino pins 2-5. Connect appliance neutral through relay COM and NO contacts.' },
      { title: 'Install voice app', description: 'Install "Arduino Voice Control" app from Play Store. Configure voice commands: "Light on", "Fan off", etc.' },
      { title: 'Program voice parser', description: 'Read serial input. Parse commands. Toggle corresponding relay based on received string.' },
      { title: 'Add safety features', description: 'Include status feedback on LCD. Add manual override buttons for each relay.' },
    ],
  },
];
