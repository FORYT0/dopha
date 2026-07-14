import { useState } from 'react';
import { FlaskConical, Clock, BarChart3, ChevronRight, X, Plus, BookOpen } from 'lucide-react';
import { projectGuides, type ProjectGuide } from '../data/projects';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import type { ProjectComponent } from '../data/projects';

const difficultyConfig = {
  Beginner: { color: 'bg-green-100 text-green-700', icon: <BarChart3 size={14} /> },
  Intermediate: { color: 'bg-[var(--amber-light)] text-[var(--amber)]', icon: <BarChart3 size={14} /> },
  Advanced: { color: 'bg-red-100 text-red-600', icon: <BarChart3 size={14} /> },
};

// ─── Circuit Diagrams ───────────────────────────────────────────────────────

function CircuitDiagram({ type, onComponentClick }: { type: string; onComponentClick: (label: string) => void }) {
  const teal = '#0d9488';
  const tealLight = '#e6fffa';

  const g = (label: string, children: React.ReactNode) => (
    <g
      onClick={() => onComponentClick(label)}
      className="cursor-pointer hover:opacity-75 transition-opacity"
    >
      {children}
    </g>
  );

  // ── Arduino Uno reusable block ──────────────────────────────────────────
  const ArduinoBlock = ({ x, y, pins }: { x: number; y: number; pins: { label: string; y: number }[] }) => (
    <g onClick={() => onComponentClick('Arduino Uno R3')} className="cursor-pointer hover:opacity-75 transition-opacity">
      <rect x={x} y={y} width="160" height={Math.max(240, pins.length * 22 + 60)} rx="8"
        fill="#f8f9fa" stroke={teal} strokeWidth="2.5" />
      <rect x={x} y={y} width="160" height="30" rx="8" fill={teal} />
      <rect x={x} y={y + 22} width="160" height="8" fill={teal} />
      <text x={x + 80} y={y + 20} textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">Arduino Uno</text>
      {pins.map((pin, i) => (
        <g key={i}>
          <circle cx={x + 155} cy={pin.y} r="4" fill={teal} />
          <text x={x + 145} y={pin.y + 4} textAnchor="end" fill="#6b7280" fontSize="10">{pin.label}</text>
        </g>
      ))}
    </g>
  );

  const ESP32Block = ({ x, y }: { x: number; y: number }) => (
    <g onClick={() => onComponentClick('ESP32 DevKit')} className="cursor-pointer hover:opacity-75 transition-opacity">
      <rect x={x} y={y} width="150" height="200" rx="8" fill="#f0fdf4" stroke={teal} strokeWidth="2.5" />
      <rect x={x} y={y} width="150" height="30" rx="8" fill={teal} />
      <rect x={x} y={y + 22} width="150" height="8" fill={teal} />
      <text x={x + 75} y={y + 20} textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">ESP32</text>
      <text x={x + 75} y={y + 52} textAnchor="middle" fill="#6b7280" fontSize="9">WiFi + BT SoC</text>
      {[
        { label: 'GPIO4', cy: y + 75 },
        { label: 'GPIO21 (SDA)', cy: y + 95 },
        { label: 'GPIO22 (SCL)', cy: y + 115 },
        { label: 'GPIO34 (ADC)', cy: y + 135 },
        { label: '3.3V / 5V', cy: y + 155 },
        { label: 'GND', cy: y + 175 },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={x + 145} cy={p.cy} r="3.5" fill={teal} />
          <text x={x + 138} y={p.cy + 4} textAnchor="end" fill="#6b7280" fontSize="9">{p.label}</text>
        </g>
      ))}
    </g>
  );

  // ── Wire helpers ────────────────────────────────────────────────────────
  const Wire = ({ d, color = teal, dashed = false }: { d: string; color?: string; dashed?: boolean }) => (
    <path d={d} stroke={color} strokeWidth="1.8" fill="none"
      strokeDasharray={dashed ? '5,3' : undefined} />
  );

  const Label = ({ x, y, text, color = teal }: { x: number; y: number; text: string; color?: string }) => (
    <text x={x} y={y} fill={color} fontSize="10" fontWeight="500">{text}</text>
  );

  // ── BLINK ───────────────────────────────────────────────────────────────
  if (type === 'blink') return (
    <svg viewBox="0 0 620 340" className="w-full h-auto">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={teal} />
        </marker>
      </defs>
      {/* Arduino */}
      <ArduinoBlock x={60} y={50} pins={[
        { label: 'Pin 13', y: 145 },
        { label: 'GND', y: 185 },
      ]} />
      {/* Breadboard */}
      {g('Breadboard', <>
        <rect x="320" y="50" width="200" height="240" rx="6" fill="#fef9c3" stroke="#d4d4d8" strokeWidth="1.5" />
        <text x="420" y="75" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="600">Breadboard</text>
        {Array.from({ length: 5 }).map((_, col) =>
          Array.from({ length: 8 }).map((_, row) => (
            <circle key={`${col}-${row}`} cx={345 + col * 32} cy={100 + row * 22} r="3.5" fill="#d4d4d8" />
          ))
        )}
      </>)}
      {/* Resistor */}
      {g('Resistor (220Ω)', <>
        <rect x="380" y="148" width="60" height="20" rx="4" fill={tealLight} stroke={teal} strokeWidth="1.5" />
        <text x="410" y="162" textAnchor="middle" fill={teal} fontSize="10" fontWeight="700">220 Ω</text>
      </>)}
      {/* LED */}
      {g('LED (5mm)', <>
        <circle cx="480" cy="175" r="22" fill="#fef9c3" stroke={teal} strokeWidth="2" />
        <polygon points="472,163 472,187 492,175" fill="none" stroke={teal} strokeWidth="1.5" />
        <line x1="492" y1="163" x2="492" y2="187" stroke={teal} strokeWidth="1.5" />
        {/* light rays */}
        <line x1="498" y1="158" x2="506" y2="150" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="504" y1="168" x2="514" y2="163" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <text x="480" y="210" textAnchor="middle" fill={teal} fontSize="11" fontWeight="700">LED</text>
      </>)}
      {/* Wires */}
      <Wire d="M215,145 L440,158" />
      <Wire d="M215,185 L370,175" color="#374151" />
      <Wire d="M440,175 L458,175" color="#374151" />
      <Wire d="M502,175 L540,175 L540,290 L320,290" color="#374151" dashed />
      <Label x={225} y={138} text="Pin 13 →" />
      <Label x={225} y={200} text="GND →" color="#374151" />
    </svg>
  );

  // ── DHT22 + LCD ─────────────────────────────────────────────────────────
  if (type === 'dht22-lcd') return (
    <svg viewBox="0 0 700 380" className="w-full h-auto">
      <ArduinoBlock x={40} y={50} pins={[
        { label: '5V', y: 130 },
        { label: 'Pin 2 (DATA)', y: 155 },
        { label: 'GND', y: 180 },
        { label: 'A4 (SDA)', y: 225 },
        { label: 'A5 (SCL)', y: 250 },
      ]} />
      {/* DHT22 */}
      {g('DHT22 Sensor', <>
        <rect x="290" y="55" width="120" height="90" rx="8" fill={tealLight} stroke={teal} strokeWidth="2" />
        <text x="350" y="85" textAnchor="middle" fill={teal} fontSize="13" fontWeight="bold">DHT22</text>
        <text x="350" y="105" textAnchor="middle" fill="#6b7280" fontSize="10">Temp + Humidity</text>
        <text x="350" y="122" textAnchor="middle" fill="#6b7280" fontSize="9">VCC · DATA · GND</text>
      </>)}
      {/* 10k Resistor (pull-up) */}
      {g('Resistor (10KΩ)', <>
        <rect x="450" y="75" width="55" height="18" rx="4" fill="#fef3c7" stroke="#ca8a04" strokeWidth="1.5" />
        <text x="477" y="88" textAnchor="middle" fill="#92400e" fontSize="9" fontWeight="700">10kΩ pull-up</text>
      </>)}
      {/* LCD */}
      {g('LCD 16x2 (I2C)', <>
        <rect x="290" y="200" width="200" height="110" rx="8" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
        <rect x="305" y="218" width="170" height="50" rx="4" fill="#d1fae5" />
        <text x="390" y="240" textAnchor="middle" fill="#065f46" fontSize="11" fontWeight="600">Temp: 25.4°C</text>
        <text x="390" y="258" textAnchor="middle" fill="#065f46" fontSize="11" fontWeight="600">Hum:  61.2%</text>
        <text x="390" y="290" textAnchor="middle" fill="#0284c7" fontSize="11" fontWeight="bold">LCD 16×2 (I2C)</text>
        <text x="390" y="305" textAnchor="middle" fill="#6b7280" fontSize="9">SDA → A4 · SCL → A5</text>
      </>)}
      {/* Wires */}
      <Wire d="M200,130 L290,90" color="#dc2626" />
      <Wire d="M200,155 L290,105" />
      <Wire d="M200,180 L290,135" color="#374151" />
      <Wire d="M200,225 L290,260" />
      <Wire d="M200,250 L290,275" />
      <Wire d="M410,90 L450,84" dashed />
      <Label x={208} y={126} text="5V" color="#dc2626" />
      <Label x={208} y={151} text="Pin 2" />
      <Label x={208} y={176} text="GND" color="#374151" />
      <Label x={208} y={221} text="SDA" />
      <Label x={208} y={246} text="SCL" />
    </svg>
  );

  // ── ULTRASONIC ──────────────────────────────────────────────────────────
  if (type === 'ultrasonic') return (
    <svg viewBox="0 0 700 380" className="w-full h-auto">
      <ArduinoBlock x={40} y={50} pins={[
        { label: '5V', y: 130 },
        { label: 'GND', y: 155 },
        { label: 'Pin 9 (Trig)', y: 190 },
        { label: 'Pin 10 (Echo)', y: 215 },
        { label: 'Pin 11 (CLK)', y: 250 },
        { label: 'Pin 12 (DIO)', y: 275 },
      ]} />
      {/* HC-SR04 */}
      {g('HC-SR04 Sensor', <>
        <rect x="290" y="50" width="150" height="100" rx="8" fill={tealLight} stroke={teal} strokeWidth="2" />
        <circle cx="330" cy="90" r="18" fill="none" stroke={teal} strokeWidth="2" />
        <circle cx="330" cy="90" r="10" fill={teal} opacity="0.25" />
        <circle cx="380" cy="90" r="18" fill="none" stroke={teal} strokeWidth="2" />
        <circle cx="380" cy="90" r="10" fill={teal} opacity="0.25" />
        <text x="355" y="130" textAnchor="middle" fill={teal} fontSize="12" fontWeight="bold">HC-SR04</text>
        <text x="318" y="148" textAnchor="middle" fill="#6b7280" fontSize="9">VCC GND Trig Echo</text>
      </>)}
      {/* 7-Segment */}
      {g('7-Segment Display', <>
        <rect x="290" y="210" width="150" height="110" rx="8" fill="#fafafa" stroke={teal} strokeWidth="2" />
        {/* fake 7-seg display */}
        <rect x="310" y="228" width="110" height="60" rx="3" fill="#1a1a2e" />
        <text x="365" y="268" textAnchor="middle" fill="#00ff88" fontSize="28" fontFamily="monospace" fontWeight="bold">024</text>
        <text x="365" y="300" textAnchor="middle" fill={teal} fontSize="12" fontWeight="bold">TM1637 Display</text>
        <text x="365" y="314" textAnchor="middle" fill="#6b7280" fontSize="9">CLK·DIO</text>
      </>)}
      {/* Ultrasonic waves */}
      {[18, 30, 42].map((r, i) => (
        <path key={i} d={`M440,90 Q460,${90 - r} 480,90`} stroke={teal} strokeWidth="1.2" fill="none" opacity={0.4 + i * 0.2} />
      ))}
      <text x="490" y="94" fill={teal} fontSize="10">← distance</text>
      {/* Wires */}
      <Wire d="M200,130 L290,75" color="#dc2626" />
      <Wire d="M200,155 L290,100" color="#374151" />
      <Wire d="M200,190 L290,125" />
      <Wire d="M200,215 L290,140" />
      <Wire d="M200,250 L290,265" />
      <Wire d="M200,275 L290,280" />
      <Label x={208} y={126} text="VCC" color="#dc2626" />
      <Label x={208} y={151} text="GND" color="#374151" />
      <Label x={208} y={186} text="Trig" />
      <Label x={208} y={211} text="Echo" />
      <Label x={208} y={246} text="CLK" />
      <Label x={208} y={271} text="DIO" />
    </svg>
  );

  // ── PIR ALARM ───────────────────────────────────────────────────────────
  if (type === 'pir-alarm') return (
    <svg viewBox="0 0 700 360" className="w-full h-auto">
      <ArduinoBlock x={40} y={50} pins={[
        { label: '5V', y: 130 },
        { label: 'GND', y: 155 },
        { label: 'Pin 2 (PIR)', y: 190 },
        { label: 'Pin 12 (Buzzer)', y: 225 },
        { label: 'Pin 13 (LED)', y: 260 },
      ]} />
      {/* PIR */}
      {g('PIR Motion Sensor', <>
        <rect x="290" y="55" width="120" height="95" rx="8" fill={tealLight} stroke={teal} strokeWidth="2" />
        <circle cx="350" cy="90" r="22" fill="none" stroke={teal} strokeWidth="2" />
        <circle cx="350" cy="90" r="14" fill={teal} opacity="0.15" />
        <circle cx="350" cy="90" r="7" fill={teal} opacity="0.3" />
        <text x="350" y="132" textAnchor="middle" fill={teal} fontSize="12" fontWeight="bold">PIR Sensor</text>
      </>)}
      {/* motion lines */}
      {[1, 2, 3].map(i => (
        <line key={i} x1={250 - i * 18} y1={90} x2={290} y2={90}
          stroke={teal} strokeWidth="1.2" strokeDasharray="3,2" opacity={i * 0.3} />
      ))}
      {/* Buzzer */}
      {g('Buzzer Module', <>
        <rect x="290" y="195" width="110" height="70" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="345" cy="225" r="16" fill="none" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="345" cy="225" r="8" fill="#f59e0b" opacity="0.3" />
        <text x="345" y="252" textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="bold">Buzzer</text>
      </>)}
      {/* LED */}
      {g('LED (Red)', <>
        <circle cx="510" cy="270" r="20" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" />
        <polygon points="502,260 502,280 520,270" fill="none" stroke="#ef4444" strokeWidth="1.5" />
        <line x1="520" y1="260" x2="520" y2="280" stroke="#ef4444" strokeWidth="1.5" />
        <text x="510" y="302" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold">Red LED</text>
      </>)}
      {/* Resistor */}
      {g('Resistor (220Ω)', <>
        <rect x="430" y="262" width="55" height="16" rx="4" fill={tealLight} stroke={teal} strokeWidth="1.5" />
        <text x="457" y="274" textAnchor="middle" fill={teal} fontSize="9" fontWeight="700">220Ω</text>
      </>)}
      {/* Wires */}
      <Wire d="M200,130 L290,80" color="#dc2626" />
      <Wire d="M200,155 L290,110" color="#374151" />
      <Wire d="M200,190 L290,120" />
      <Wire d="M200,225 L290,225" color="#f59e0b" />
      <Wire d="M200,260 L430,270" />
      <Wire d="M485,270 L490,270" />
      <Label x={208} y={126} text="5V" color="#dc2626" />
      <Label x={208} y={151} text="GND" color="#374151" />
      <Label x={208} y={186} text="OUT→Pin 2" />
      <Label x={208} y={221} text="Pin 12" color="#92400e" />
      <Label x={208} y={256} text="Pin 13" />
    </svg>
  );

  // ── LINE FOLLOWER ───────────────────────────────────────────────────────
  if (type === 'line-follower') return (
    <svg viewBox="0 0 740 420" className="w-full h-auto">
      <ArduinoBlock x={30} y={60} pins={[
        { label: 'Pin 2 (L_IR)', y: 135 },
        { label: 'Pin 3 (R_IR)', y: 157 },
        { label: 'Pin 5 (ENA)', y: 195 },
        { label: 'Pin 6 (IN1)', y: 217 },
        { label: 'Pin 7 (IN2)', y: 239 },
        { label: 'Pin 8 (IN3)', y: 261 },
        { label: 'Pin 9 (IN4)', y: 283 },
        { label: 'Pin 10 (ENB)', y: 305 },
      ]} />
      {/* Left IR Sensor */}
      {g('IR Sensor (TCRT5000)', <>
        <rect x="270" y="50" width="115" height="75" rx="8" fill={tealLight} stroke={teal} strokeWidth="2" />
        <circle cx="305" cy="82" r="10" fill={teal} opacity="0.35" />
        <circle cx="330" cy="82" r="8" fill={teal} opacity="0.2" />
        <text x="327" y="108" textAnchor="middle" fill={teal} fontSize="11" fontWeight="bold">IR Left</text>
      </>)}
      {/* Right IR Sensor */}
      {g('IR Sensor (TCRT5000)', <>
        <rect x="270" y="145" width="115" height="75" rx="8" fill={tealLight} stroke={teal} strokeWidth="2" />
        <circle cx="305" cy="177" r="10" fill={teal} opacity="0.35" />
        <circle cx="330" cy="177" r="8" fill={teal} opacity="0.2" />
        <text x="327" y="203" textAnchor="middle" fill={teal} fontSize="11" fontWeight="bold">IR Right</text>
      </>)}
      {/* L298N */}
      {g('L298N Motor Driver', <>
        <rect x="270" y="255" width="150" height="110" rx="8" fill="#fff7ed" stroke="#f97316" strokeWidth="2" />
        <text x="345" y="295" textAnchor="middle" fill="#f97316" fontSize="14" fontWeight="bold">L298N</text>
        <text x="345" y="315" textAnchor="middle" fill="#6b7280" fontSize="10">Motor Driver</text>
        <text x="345" y="332" textAnchor="middle" fill="#6b7280" fontSize="9">IN1·IN2·ENA (Left)</text>
        <text x="345" y="348" textAnchor="middle" fill="#6b7280" fontSize="9">IN3·IN4·ENB (Right)</text>
      </>)}
      {/* Robot Chassis outline */}
      {g('Robot Car Chassis Kit (2WD)', <>
        <rect x="475" y="120" width="220" height="180" rx="12" fill="#f9fafb" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="6,3" />
        <text x="585" y="145" textAnchor="middle" fill="#9ca3af" fontSize="11" fontWeight="600">2WD Robot Chassis</text>
      </>)}
      {/* Left Motor */}
      {g('DC Motor (3-6V) with Gearbox', <>
        <ellipse cx="530" cy="185" rx="35" ry="22" fill="#d1fae5" stroke={teal} strokeWidth="2" />
        <text x="530" y="181" textAnchor="middle" fill={teal} fontSize="10" fontWeight="bold">Motor L</text>
        <text x="530" y="195" textAnchor="middle" fill="#6b7280" fontSize="9">DC 6V</text>
        <rect x="505" y="207" width="50" height="14" rx="4" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
        <text x="530" y="218" textAnchor="middle" fill="#6b7280" fontSize="8">Wheel</text>
      </>)}
      {/* Right Motor */}
      {g('DC Motor (3-6V) with Gearbox', <>
        <ellipse cx="650" cy="185" rx="35" ry="22" fill="#d1fae5" stroke={teal} strokeWidth="2" />
        <text x="650" y="181" textAnchor="middle" fill={teal} fontSize="10" fontWeight="bold">Motor R</text>
        <text x="650" y="195" textAnchor="middle" fill="#6b7280" fontSize="9">DC 6V</text>
        <rect x="625" y="207" width="50" height="14" rx="4" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
        <text x="650" y="218" textAnchor="middle" fill="#6b7280" fontSize="8">Wheel</text>
      </>)}
      {/* Battery */}
      {g('18650 Battery', <>
        <rect x="475" y="330" width="220" height="40" rx="8" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5" />
        <text x="585" y="355" textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="bold">18650 Battery × 2 (7.4V)</text>
      </>)}
      {/* Wires */}
      <Wire d="M190,135 L270,87" />
      <Wire d="M190,157 L270,182" />
      <Wire d="M190,195 L270,280" color="#f97316" dashed />
      <Wire d="M190,217 L270,295" color="#f97316" dashed />
      <Wire d="M190,261 L270,320" color="#f97316" dashed />
      <Wire d="M420,295 L530,207" />
      <Wire d="M420,310 L650,207" />
      <Wire d="M585,330 L585,365" color="#ca8a04" />
      <Label x={198} y={130} text="L sensor" />
      <Label x={198} y={153} text="R sensor" />
      <Label x={198} y={191} text="ENA/IN1/IN2" color="#f97316" />
    </svg>
  );

  // ── IoT WEATHER STATION ─────────────────────────────────────────────────
  if (type === 'iot-weather') return (
    <svg viewBox="0 0 740 400" className="w-full h-auto">
      <ESP32Block x={30} y={80} />
      {/* DHT22 */}
      {g('DHT22 Sensor', <>
        <rect x="260" y="40" width="120" height="80" rx="8" fill={tealLight} stroke={teal} strokeWidth="2" />
        <text x="320" y="68" textAnchor="middle" fill={teal} fontSize="12" fontWeight="bold">DHT22</text>
        <text x="320" y="86" textAnchor="middle" fill="#6b7280" fontSize="10">Temp · Humidity</text>
        <text x="320" y="102" textAnchor="middle" fill="#6b7280" fontSize="9">DATA → GPIO4</text>
      </>)}
      {/* BMP180 */}
      {g('BMP180 Barometric Pressure Sensor', <>
        <rect x="260" y="145" width="120" height="80" rx="8" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
        <text x="320" y="173" textAnchor="middle" fill="#0284c7" fontSize="12" fontWeight="bold">BMP180</text>
        <text x="320" y="191" textAnchor="middle" fill="#6b7280" fontSize="10">Pressure · Temp</text>
        <text x="320" y="207" textAnchor="middle" fill="#6b7280" fontSize="9">I2C: SDA/SCL</text>
      </>)}
      {/* Rain Sensor */}
      {g('Rain Sensor Module', <>
        <rect x="260" y="250" width="120" height="80" rx="8" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
        <text x="320" y="278" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">Rain Sensor</text>
        <text x="320" y="296" textAnchor="middle" fill="#6b7280" fontSize="10">Analog output</text>
        <text x="320" y="312" textAnchor="middle" fill="#6b7280" fontSize="9">AO → GPIO34</text>
      </>)}
      {/* LCD */}
      {g('LCD 16x2 (I2C)', <>
        <rect x="460" y="80" width="200" height="100" rx="8" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
        <rect x="474" y="95" width="172" height="55" rx="3" fill="#d1fae5" />
        <text x="560" y="120" textAnchor="middle" fill="#065f46" fontSize="11" fontWeight="600">T:25°C H:62%</text>
        <text x="560" y="138" textAnchor="middle" fill="#065f46" fontSize="11" fontWeight="600">P:1012hPa</text>
        <text x="560" y="163" textAnchor="middle" fill="#0284c7" fontSize="12" fontWeight="bold">LCD 16×2 (I2C)</text>
      </>)}
      {/* Solar Panel */}
      {g('Solar Panel 6V', <>
        <rect x="460" y="230" width="200" height="120" rx="8" fill="#fefce8" stroke="#ca8a04" strokeWidth="2" />
        {[0, 1, 2, 3].map(col =>
          [0, 1, 2].map(row => (
            <rect key={`${col}-${row}`} x={475 + col * 45} y={248 + row * 28} width="38" height="22"
              rx="2" fill="#fde68a" stroke="#ca8a04" strokeWidth="0.5" />
          ))
        )}
        <text x="560" y="342" textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="bold">Solar Panel 6V</text>
      </>)}
      {/* WiFi cloud */}
      <ellipse cx="650" cy="35" rx="55" ry="28" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
      <text x="650" y="31" textAnchor="middle" fill="#0284c7" fontSize="10" fontWeight="bold">WiFi</text>
      <text x="650" y="45" textAnchor="middle" fill="#0284c7" fontSize="9">ThingSpeak</text>
      {/* Wires */}
      <Wire d="M180,155 L260,80" />
      <Wire d="M180,175 L260,185" color="#0284c7" />
      <Wire d="M180,195 L260,290" color="#3b82f6" />
      <Wire d="M180,215 L460,130" color="#0284c7" />
      <Wire d="M180,235 L460,145" color="#0284c7" />
      <Wire d="M610,40 L650,40" color="#0284c7" dashed />
      <Wire d="M560,180 L560,230" color="#374151" dashed />
      <Label x={188} y={150} text="GPIO4" />
      <Label x={188} y={171} text="SDA/SCL" color="#0284c7" />
      <Label x={188} y={191} text="GPIO34" color="#3b82f6" />
    </svg>
  );

  // ── BLUETOOTH CAR ───────────────────────────────────────────────────────
  if (type === 'bt-car') return (
    <svg viewBox="0 0 740 400" className="w-full h-auto">
      <ArduinoBlock x={30} y={60} pins={[
        { label: 'TX (Pin 1)', y: 140 },
        { label: 'RX (Pin 0)', y: 163 },
        { label: 'Pin 5 (ENA)', y: 200 },
        { label: 'Pin 6 (IN1)', y: 222 },
        { label: 'Pin 7 (IN2)', y: 244 },
        { label: 'Pin 8 (IN3)', y: 266 },
        { label: 'Pin 9 (IN4)', y: 288 },
        { label: 'Pin 10 (ENB)', y: 310 },
      ]} />
      {/* HC-05 Bluetooth */}
      {g('HC-05 Bluetooth Module', <>
        <rect x="270" y="40" width="150" height="90" rx="8" fill="#eff6ff" stroke="#6366f1" strokeWidth="2" />
        {/* Bluetooth symbol */}
        <path d="M310,65 L330,80 L315,92 M330,80 L315,68 L330,80 L315,92" stroke="#6366f1" strokeWidth="2" fill="none" />
        <text x="370" y="72" textAnchor="middle" fill="#6366f1" fontSize="13" fontWeight="bold">HC-05</text>
        <text x="370" y="90" textAnchor="middle" fill="#6b7280" fontSize="10">Bluetooth 2.0</text>
        <text x="370" y="108" textAnchor="middle" fill="#6b7280" fontSize="9">TX·RX·VCC·GND</text>
      </>)}
      {/* Phone */}
      <g>
        <rect x="500" y="30" width="80" height="130" rx="10" fill="#f8f9fa" stroke="#6366f1" strokeWidth="2" />
        <rect x="510" y="50" width="60" height="80" rx="3" fill="#e0e7ff" />
        <circle cx="540" cy="145" r="6" fill="#6366f1" opacity="0.5" />
        <text x="540" y="90" textAnchor="middle" fill="#6366f1" fontSize="10" fontWeight="bold">Android</text>
        <text x="540" y="106" textAnchor="middle" fill="#6b7280" fontSize="9">BT Controller</text>
        {/* BT signal */}
        {[10, 18, 26].map((r, i) => (
          <path key={i} d={`M420,85 Q430,${85 - r} 500,85`} stroke="#6366f1" strokeWidth="1.2" fill="none" opacity={0.3 + i * 0.25} strokeDasharray="4,2" />
        ))}
      </g>
      {/* L298N */}
      {g('L298N Motor Driver', <>
        <rect x="270" y="185" width="150" height="120" rx="8" fill="#fff7ed" stroke="#f97316" strokeWidth="2" />
        <text x="345" y="225" textAnchor="middle" fill="#f97316" fontSize="14" fontWeight="bold">L298N</text>
        <text x="345" y="244" textAnchor="middle" fill="#6b7280" fontSize="10">Dual Motor Driver</text>
        <text x="345" y="262" textAnchor="middle" fill="#6b7280" fontSize="9">OUT1/2 → Motor L</text>
        <text x="345" y="278" textAnchor="middle" fill="#6b7280" fontSize="9">OUT3/4 → Motor R</text>
      </>)}
      {/* Chassis */}
      {g('Robot Car Chassis Kit (2WD)', <>
        <rect x="480" y="180" width="220" height="185" rx="12" fill="#f9fafb" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="6,3" />
        <text x="590" y="205" textAnchor="middle" fill="#9ca3af" fontSize="11" fontWeight="600">2WD Chassis</text>
      </>)}
      {/* Motors */}
      {g('DC Motor (3-6V) Twin Pack', <>
        <ellipse cx="530" cy="250" rx="32" ry="20" fill="#d1fae5" stroke={teal} strokeWidth="1.5" />
        <text x="530" y="255" textAnchor="middle" fill={teal} fontSize="10" fontWeight="bold">Motor L</text>
        <ellipse cx="650" cy="250" rx="32" ry="20" fill="#d1fae5" stroke={teal} strokeWidth="1.5" />
        <text x="650" y="255" textAnchor="middle" fill={teal} fontSize="10" fontWeight="bold">Motor R</text>
      </>)}
      {/* Battery */}
      {g('18650 Battery', <>
        <rect x="480" y="360" width="220" height="35" rx="8" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5" />
        <text x="590" y="382" textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="bold">18650 Battery × 2</text>
      </>)}
      {/* Wires */}
      <Wire d="M190,140 L270,75" color="#6366f1" />
      <Wire d="M190,163 L270,95" color="#6366f1" />
      <Wire d="M190,200 L270,215" color="#f97316" dashed />
      <Wire d="M190,244 L270,240" color="#f97316" dashed />
      <Wire d="M190,266 L270,258" color="#f97316" dashed />
      <Wire d="M420,240 L498,250" />
      <Wire d="M420,256 L618,250" />
      <Wire d="M590,360 L590,365" color="#ca8a04" />
      <Label x={198} y={136} text="TX→RX" color="#6366f1" />
      <Label x={198} y={159} text="RX→TX" color="#6366f1" />
    </svg>
  );

  // ── PLANT WATERER ───────────────────────────────────────────────────────
  if (type === 'plant-waterer') return (
    <svg viewBox="0 0 740 380" className="w-full h-auto">
      <ArduinoBlock x={30} y={60} pins={[
        { label: 'A0 (Moisture)', y: 140 },
        { label: '5V', y: 165 },
        { label: 'GND', y: 190 },
        { label: 'Pin 7 (Relay)', y: 225 },
        { label: 'A4 (SDA)', y: 260 },
        { label: 'A5 (SCL)', y: 285 },
      ]} />
      {/* Soil Moisture Sensor */}
      {g('Soil Moisture Sensor', <>
        <rect x="270" y="50" width="130" height="90" rx="8" fill="#d1fae5" stroke="#065f46" strokeWidth="2" />
        {/* fork prongs */}
        <rect x="300" y="95" width="10" height="35" rx="3" fill="#065f46" />
        <rect x="320" y="95" width="10" height="35" rx="3" fill="#065f46" />
        <rect x="340" y="95" width="10" height="35" rx="3" fill="#065f46" />
        {/* soil */}
        <rect x="290" y="125" width="80" height="15" rx="2" fill="#92400e" opacity="0.5" />
        <text x="335" y="78" textAnchor="middle" fill="#065f46" fontSize="11" fontWeight="bold">Soil Moisture</text>
        <text x="335" y="93" textAnchor="middle" fill="#6b7280" fontSize="9">AO → A0</text>
      </>)}
      {/* Relay */}
      {g('Relay Module 5V (1-Channel)', <>
        <rect x="270" y="190" width="140" height="100" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
        <rect x="290" y="210" width="50" height="30" rx="4" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="315" cy="225" r="8" fill="#f59e0b" opacity="0.5" />
        <text x="370" y="228" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">5V Relay</text>
        <text x="370" y="246" textAnchor="middle" fill="#6b7280" fontSize="9">IN → Pin 7</text>
        <text x="370" y="262" textAnchor="middle" fill="#6b7280" fontSize="9">COM · NO · NC</text>
        <text x="370" y="278" textAnchor="middle" fill="#6b7280" fontSize="9">Optocoupler isolated</text>
      </>)}
      {/* LCD */}
      {g('LCD 16x2 (I2C)', <>
        <rect x="270" y="310" width="180" height="55" rx="8" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
        <rect x="282" y="320" width="155" height="30" rx="3" fill="#d1fae5" />
        <text x="360" y="332" textAnchor="middle" fill="#065f46" fontSize="9" fontWeight="600">Moisture: 45% DRY</text>
        <text x="360" y="346" textAnchor="middle" fill="#065f46" fontSize="9" fontWeight="600">Pump: ON  [■■■□□]</text>
        <text x="360" y="360" textAnchor="middle" fill="#0284c7" fontSize="10" fontWeight="bold">LCD 16×2</text>
      </>)}
      {/* Water Pump */}
      {g('Soil Moisture Sensor', <>
        <ellipse cx="570" cy="220" rx="55" ry="40" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
        <text x="570" y="213" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">Water Pump</text>
        <text x="570" y="229" textAnchor="middle" fill="#6b7280" fontSize="10">5V Mini Pump</text>
        {/* water drops */}
        {[0, 1, 2].map(i => (
          <ellipse key={i} cx={615 + i * 20} cy={215 - i * 8} rx="4" ry="6" fill="#93c5fd" opacity={0.6 + i * 0.1} />
        ))}
      </>)}
      {/* Pipe from pump */}
      <path d="M625,220 Q680,200 700,170" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
      {/* Water out */}
      {[0, 1, 2].map(i => (
        <line key={i} x1={693 + i * 5} y1={165} x2={688 + i * 5} y2={185}
          stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
      ))}
      {/* Power Supply */}
      {g('5V Power Supply Adapter', <>
        <rect x="470" y="310" width="160" height="50" rx="8" fill="#f0fdf4" stroke={teal} strokeWidth="1.5" />
        <text x="550" y="332" textAnchor="middle" fill={teal} fontSize="11" fontWeight="bold">5V Power Adapter</text>
        <text x="550" y="349" textAnchor="middle" fill="#6b7280" fontSize="9">Powers pump + Arduino</text>
      </>)}
      {/* Relay → pump wire */}
      <Wire d="M410,240 L515,220" color="#f59e0b" />
      {/* Wires Arduino → components */}
      <Wire d="M190,140 L270,95" />
      <Wire d="M190,165 L270,75" color="#dc2626" />
      <Wire d="M190,190 L270,85" color="#374151" />
      <Wire d="M190,225 L270,240" color="#f59e0b" />
      <Wire d="M190,260 L270,335" color="#0284c7" />
      <Wire d="M190,285 L270,345" color="#0284c7" />
      <Label x={198} y={136} text="A0" />
      <Label x={198} y={161} text="5V" color="#dc2626" />
      <Label x={198} y={186} text="GND" color="#374151" />
      <Label x={198} y={221} text="Relay IN" color="#f59e0b" />
    </svg>
  );

  // ── VOICE HOME ──────────────────────────────────────────────────────────
  if (type === 'voice-home') return (
    <svg viewBox="0 0 740 420" className="w-full h-auto">
      <ArduinoBlock x={30} y={70} pins={[
        { label: 'TX/RX (BT)', y: 145 },
        { label: 'Pin 2 (Relay 1)', y: 190 },
        { label: 'Pin 3 (Relay 2)', y: 212 },
        { label: 'Pin 4 (Relay 3)', y: 234 },
        { label: 'Pin 5 (Relay 4)', y: 256 },
        { label: 'A4 (SDA)', y: 295 },
        { label: 'A5 (SCL)', y: 317 },
      ]} />
      {/* HC-05 */}
      {g('HC-05 Bluetooth Module', <>
        <rect x="270" y="55" width="140" height="80" rx="8" fill="#eff6ff" stroke="#6366f1" strokeWidth="2" />
        <text x="340" y="85" textAnchor="middle" fill="#6366f1" fontSize="12" fontWeight="bold">HC-05</text>
        <text x="340" y="103" textAnchor="middle" fill="#6b7280" fontSize="10">Bluetooth RX/TX</text>
        <text x="340" y="120" textAnchor="middle" fill="#6b7280" fontSize="9">TX→Pin0 · RX→Pin1</text>
      </>)}
      {/* 4-Channel Relay */}
      {g('Relay Module 5V (4-Channel)', <>
        <rect x="270" y="175" width="160" height="160" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
        <text x="350" y="200" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="bold">4-Channel Relay</text>
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <rect x={285} y={215 + i * 28} width="130" height="18" rx="4"
              fill={i % 2 === 0 ? '#d1fae5' : '#fee2e2'} stroke="#d1d5db" strokeWidth="1" />
            <circle cx={296} cy={224 + i * 28} r="5" fill={i % 2 === 0 ? '#059669' : '#dc2626'} />
            <text x={308} y={228 + i * 28} fill="#374151" fontSize="9" fontWeight="600">
              {['Light', 'Fan', 'AC', 'TV'][i]}
            </text>
            <text x={395} y={228 + i * 28} textAnchor="end" fill="#6b7280" fontSize="8">
              {i % 2 === 0 ? 'ON' : 'OFF'}
            </text>
          </g>
        ))}
      </>)}
      {/* LCD */}
      {g('LCD 16x2 (I2C)', <>
        <rect x="270" y="360" width="180" height="50" rx="8" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
        <rect x="282" y="370" width="155" height="30" rx="3" fill="#d1fae5" />
        <text x="360" y="382" textAnchor="middle" fill="#065f46" fontSize="9" fontWeight="600">Light: ON  Fan: OFF</text>
        <text x="360" y="396" textAnchor="middle" fill="#065f46" fontSize="9" fontWeight="600">AC: ON   TV: OFF</text>
      </>)}
      {/* Phone with voice */}
      <g>
        <rect x="510" y="50" width="80" height="140" rx="10" fill="#f8f9fa" stroke="#6366f1" strokeWidth="2" />
        <rect x="520" y="68" width="60" height="90" rx="3" fill="#e0e7ff" />
        <circle cx="550" cy="163" r="6" fill="#6366f1" opacity="0.5" />
        <text x="550" y="95" textAnchor="middle" fill="#6366f1" fontSize="9" fontWeight="bold">Voice</text>
        <text x="550" y="110" textAnchor="middle" fill="#6366f1" fontSize="9" fontWeight="bold">Control</text>
        <text x="550" y="130" textAnchor="middle" fill="#6b7280" fontSize="8">"Light on"</text>
        {/* mic icon */}
        <rect x="542" y="142" width="16" height="12" rx="4" fill="#6366f1" opacity="0.6" />
        {/* BT waves */}
        {[10, 20, 30].map((r, i) => (
          <path key={i} d={`M415,95 Q445,${95 - r} 510,95`} stroke="#6366f1" strokeWidth="1.2"
            fill="none" opacity={0.2 + i * 0.25} strokeDasharray="4,2" />
        ))}
      </g>
      {/* Appliances */}
      {[
        { label: 'Light', icon: '💡', x: 620, y: 175 },
        { label: 'Fan', icon: '🌀', x: 660, y: 230 },
        { label: 'AC', icon: '❄️', x: 620, y: 285 },
        { label: 'TV', icon: '📺', x: 660, y: 340 },
      ].map((ap, i) => (
        <g key={i}>
          <circle cx={ap.x} cy={ap.y} r="24" fill="#f9fafb" stroke="#d1d5db" strokeWidth="1.5" />
          <text x={ap.x} y={ap.y + 5} textAnchor="middle" fontSize="16">{ap.icon}</text>
          <text x={ap.x} y={ap.y + 30} textAnchor="middle" fill="#6b7280" fontSize="9">{ap.label}</text>
          <Wire d={`M430,${206 + i * 22} L${ap.x - 24},${ap.y}`} color="#f59e0b" dashed />
        </g>
      ))}
      {/* Terminal blocks */}
      {g('Terminal Blocks', <>
        <rect x="460" y="195" width="120" height="140" rx="6" fill="#f9fafb" stroke="#d1d5db" strokeWidth="1.5" />
        <text x="520" y="215" textAnchor="middle" fill="#6b7280" fontSize="10" fontWeight="600">Terminal Blocks</text>
        {[0, 1, 2, 3].map(i => (
          <rect key={i} x="474" y={225 + i * 28} width="92" height="18" rx="3"
            fill="white" stroke="#d1d5db" strokeWidth="1" />
        ))}
      </>)}
      {/* Wires Arduino → HC-05 */}
      <Wire d="M190,145 L270,95" color="#6366f1" />
      {/* Arduino → Relay */}
      <Wire d="M190,190 L270,215" color="#f59e0b" dashed />
      <Wire d="M190,212 L270,243" color="#f59e0b" dashed />
      <Wire d="M190,234 L270,271" color="#f59e0b" dashed />
      <Wire d="M190,256 L270,299" color="#f59e0b" dashed />
      {/* Arduino → LCD */}
      <Wire d="M190,295 L270,382" color="#0284c7" />
      <Wire d="M190,317 L270,392" color="#0284c7" />
      {/* Relay → Terminals */}
      <Wire d="M430,255 L460,255" color="#374151" />
      <Label x={198} y={141} text="BT Serial" color="#6366f1" />
      <Label x={198} y={186} text="Relays 1–4" color="#f59e0b" />
    </svg>
  );

  // ── DEFAULT FALLBACK ────────────────────────────────────────────────────
  return (
    <svg viewBox="0 0 600 300" className="w-full h-auto">
      <rect x="80" y="40" width="440" height="220" rx="10" fill="#f8f9fa" stroke={teal} strokeWidth="2" strokeDasharray="8,4" />
      <text x="300" y="160" textAnchor="middle" fill={teal} fontSize="16" fontWeight="bold">Circuit Diagram</text>
      <text x="300" y="185" textAnchor="middle" fill="#6b7280" fontSize="12">Click components in the list below to add to cart</text>
    </svg>
  );
}

// ─── Project Detail Modal ────────────────────────────────────────────────────

function ProjectDetailModal({ project, onClose }: { project: ProjectGuide; onClose: () => void }) {
  const { addToCart } = useCart();

  const handleAddComponent = (comp: ProjectComponent) => {
    const product = products.find(p => p.id === comp.productId);
    if (product) {
      addToCart({ id: product.id, name: product.name, price: product.price, icon: product.icon, image: product.image });
    }
  };

  const handleAddAll = () => {
    project.components.forEach(comp => {
      const product = products.find(p => p.id === comp.productId);
      if (product) {
        addToCart({ id: product.id, name: product.name, price: product.price, icon: product.icon, image: product.image });
      }
    });
  };

  const handleDiagramClick = (label: string) => {
    const comp = project.components.find(c =>
      label.toLowerCase().includes(c.label.toLowerCase()) ||
      c.label.toLowerCase().includes(label.toLowerCase())
    );
    if (comp) handleAddComponent(comp);
  };

  const totalCost = project.components.reduce((sum, comp) => {
    const p = products.find(pr => pr.id === comp.productId);
    return sum + (p ? p.price * comp.quantity : 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[var(--medium-gray)] px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--charcoal)]">{project.title}</h2>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${difficultyConfig[project.difficulty].color}`}>
                {difficultyConfig[project.difficulty].icon} {project.difficulty}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Clock size={12} /> {project.duration}
              </span>
              <span className="text-xs text-[var(--text-muted)] bg-[var(--light-gray)] px-2 py-0.5 rounded-full">
                {project.course}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--light-gray)] rounded-lg transition-colors ml-4 shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <p className="text-[var(--text-muted)] leading-relaxed">{project.description}</p>

          {/* Circuit Diagram */}
          <div>
            <h3 className="text-base font-bold text-[var(--charcoal)] mb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-[var(--teal)]" />
              Circuit Diagram
              <span className="text-sm font-normal text-[var(--text-muted)]">— click any component to add to cart</span>
            </h3>
            <div className="border border-[var(--medium-gray)] rounded-xl p-4 bg-[var(--light-gray)]">
              <CircuitDiagram type={project.diagramType} onComponentClick={handleDiagramClick} />
            </div>
          </div>

          {/* Components */}
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h3 className="text-base font-bold text-[var(--charcoal)]">Required Components</h3>
                <p className="text-sm text-[var(--text-muted)]">Estimated total: <span className="font-semibold text-[var(--teal)]">KSh {totalCost.toLocaleString()}</span></p>
              </div>
              <button
                onClick={handleAddAll}
                className="px-5 py-2.5 bg-[var(--teal)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--teal-dark)] transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Add All to Cart
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.components.map(comp => {
                const product = products.find(p => p.id === comp.productId);
                return (
                  <button
                    key={comp.productId}
                    onClick={() => handleAddComponent(comp)}
                    className="flex items-center gap-3 p-3 bg-[var(--light-gray)] border border-[var(--medium-gray)] rounded-xl hover:border-[var(--teal)] hover:bg-[var(--teal-light)] transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white border border-[var(--medium-gray)] flex items-center justify-center shrink-0 group-hover:border-[var(--teal)] group-hover:bg-[var(--teal-light)]">
                      <Plus size={14} className="text-[var(--teal)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--charcoal)] truncate">
                        {comp.label}
                        {comp.quantity > 1 && <span className="text-[var(--text-muted)] font-normal"> ×{comp.quantity}</span>}
                      </p>
                      {product && (
                        <p className="text-xs text-[var(--teal)] font-medium">
                          KSh {product.price.toLocaleString()}
                          {comp.quantity > 1 && ` × ${comp.quantity} = KSh ${(product.price * comp.quantity).toLocaleString()}`}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-base font-bold text-[var(--charcoal)] mb-4">Step-by-Step Instructions</h3>
            <div className="space-y-5">
              {project.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--teal)] text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 pb-5 border-b border-[var(--medium-gray)] last:border-0 last:pb-0">
                    <h4 className="text-sm font-bold text-[var(--charcoal)] mb-1.5">{step.title}</h4>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.description}</p>
                    {step.code && (
                      <pre className="mt-3 bg-[var(--charcoal)] text-white p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-white/10">
                        <code>{step.code}</code>
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ProjectLabPage() {
  const [selectedProject, setSelectedProject] = useState<ProjectGuide | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const filtered = filter === 'All'
    ? projectGuides
    : projectGuides.filter(p => p.difficulty === filter);

  const counts = {
    All: projectGuides.length,
    Beginner: projectGuides.filter(p => p.difficulty === 'Beginner').length,
    Intermediate: projectGuides.filter(p => p.difficulty === 'Intermediate').length,
    Advanced: projectGuides.filter(p => p.difficulty === 'Advanced').length,
  };

  return (
    <div className="pt-16 min-h-screen">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-[var(--teal-light)] to-white py-14 border-b border-[var(--medium-gray)]">
        <div className="max-w-[1280px] mx-auto px-[5%]">
          <div className="text-sm text-[var(--text-muted)] mb-3">
            <span className="hover:text-[var(--teal)] cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span className="text-[var(--charcoal)] font-medium">Project Lab</span>
          </div>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-[var(--teal)] rounded-2xl flex items-center justify-center text-white shrink-0">
              <FlaskConical size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--charcoal)]">Project Lab</h1>
              <p className="text-[var(--text-muted)] mt-1 max-w-2xl">
                Interactive circuit diagrams for engineering projects. <strong className="text-[var(--charcoal)]">Click any component</strong> in the diagram to add it directly to your cart.
              </p>
            </div>
          </div>
          {/* Stats row */}
          <div className="flex gap-6 mt-6 flex-wrap">
            {[
              { n: counts.All, label: 'Projects' },
              { n: counts.Beginner, label: 'Beginner' },
              { n: counts.Intermediate, label: 'Intermediate' },
              { n: counts.Advanced, label: 'Advanced' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-[var(--medium-gray)] rounded-xl px-5 py-3 shadow-sm">
                <span className="text-xl font-extrabold text-[var(--teal)]">{s.n}</span>
                <span className="text-sm text-[var(--text-muted)] ml-2">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-[5%] py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                filter === d
                  ? 'bg-[var(--teal)] text-white shadow-md shadow-[var(--teal)]/20'
                  : 'bg-white border border-[var(--medium-gray)] text-[var(--text-muted)] hover:border-[var(--teal)] hover:text-[var(--teal)]'
              }`}
            >
              {d}
              <span className="ml-1.5 opacity-70 text-xs">
                ({counts[d]})
              </span>
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(project => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="bg-white border border-[var(--medium-gray)] rounded-2xl overflow-hidden hover:border-[var(--teal)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              {/* Card diagram preview */}
              <div className="h-44 bg-gradient-to-br from-[var(--light-gray)] to-white relative overflow-hidden flex items-center justify-center p-4">
                <div className="w-full scale-[0.55] origin-center pointer-events-none opacity-80">
                  <CircuitDiagram type={project.diagramType} onComponentClick={() => {}} />
                </div>
                <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${difficultyConfig[project.difficulty].color}`}>
                  {difficultyConfig[project.difficulty].icon} {project.difficulty}
                </span>
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/90 border border-[var(--medium-gray)] px-2.5 py-1 rounded-full text-xs text-[var(--text-muted)]">
                  <Clock size={11} /> {project.duration}
                </span>
              </div>

              <div className="p-5 border-t border-[var(--medium-gray)]">
                <h3 className="text-base font-bold text-[var(--charcoal)] mb-1.5 group-hover:text-[var(--teal)] transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mb-3 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] bg-[var(--light-gray)] px-2.5 py-1 rounded-full">
                    {project.components.length} components
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--teal)] group-hover:gap-2 transition-all">
                    Open Project <ChevronRight size={15} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProject && (
        <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
