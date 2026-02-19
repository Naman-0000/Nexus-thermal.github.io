import React, { useState, useMemo } from 'react';
import Engine3D from './Engine3D';
import PVGraph from './PVGraph';

const MATERIALS = {
  Steel: { name: "Hardened Steel", melt: 1700, conductivity: 15 },
  Titanium: { name: "G5 Titanium", melt: 1941, conductivity: 7 },
  Ceramic: { name: "SiC Ceramic", melt: 3000, conductivity: 120 }
};

const PRESETS = [
  { name: "Urban Cycle", thot: 1100, tcold: 320, friction: 0.12, material: "Steel" },
  { name: "Aerospace", thot: 1850, tcold: 220, friction: 0.05, material: "Titanium" },
  { name: "MIT Hyper-Eff", thot: 2800, tcold: 100, friction: 0.01, material: "Ceramic" }
];

export default function App() {
  const [thot, setThot] = useState(1100);
  const [tcold, setTcold] = useState(320);
  const [friction, setFriction] = useState(0.12);
  const [material, setMaterial] = useState('Steel');
  const [viewMode, setViewMode] = useState('piston');

  const isMelted = thot > MATERIALS[material].melt;
  const carnotLimit = 1 - (tcold / thot);
  const netEff = Math.max(0, (carnotLimit - friction) * 100);

  const applyPreset = (p) => {
    setMaterial(p.material);
    setThot(p.thot);
    setTcold(p.tcold);
    setFriction(p.friction);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#1d1d1f', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ padding: '20px 50px', borderBottom: '1px solid #f2f2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Nexus Thermal <span style={{fontWeight: '300', color: '#86868b'}}>Terminal v4.4</span></h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {PRESETS.map(p => (
            <button key={p.name} onClick={() => applyPreset(p)} style={presetBtnStyle}>{p.name}</button>
          ))}
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 85px)' }}>
        
        {/* LEFT: CONFIGURATION */}
        <div style={{ width: '380px', padding: '40px', borderRight: '1px solid #f2f2f2', overflowY: 'auto' }}>
          <h3 style={sectionLabel}>Operational Parameters</h3>
          <ParameterSlider label="Combustion Temp ($T_H$)" val={thot} set={setThot} min={400} max={3500} unit="K" color={isMelted ? '#ff3b30' : '#0066cc'} />
          <ParameterSlider label="Exhaust Sink ($T_C$)" val={tcold} set={setTcold} min={100} max={800} unit="K" />
          <ParameterSlider label="Friction Coefficient ($\mu$)" val={friction} set={setFriction} min={0} max={0.4} step={0.01} />
          
          <div style={{margin: '30px 0'}}>
            <label style={miniLabel}>Structural Material</label>
            <select value={material} onChange={(e) => setMaterial(e.target.value)} style={selectStyle}>
              {Object.keys(MATERIALS).map(m => <option key={m} value={m}>{MATERIALS[m].name}</option>)}
            </select>
          </div>

          <button onClick={() => setViewMode(viewMode === 'piston' ? 'gas' : 'piston')} style={toggleBtnStyle}>
            Switch to {viewMode === 'piston' ? 'Gas Kinetic View' : 'Mechanical View'}
          </button>

          <div style={{ marginTop: '30px', background: '#fbfbfd', borderRadius: '12px', padding: '20px', border: '1px solid #f2f2f2' }}>
            <PVGraph thot={isMelted ? 0 : thot} tcold={tcold} />
          </div>
        </div>

        {/* CENTER: 3D SIMULATION */}
        <div style={{ flex: 1, backgroundColor: '#fcfcfc', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '40px', left: '40px', zIndex: 10 }}>
            <p style={dataTag}>Net Thermal Yield</p>
            <h2 style={{ fontSize: '90px', fontWeight: '800', margin: 0, letterSpacing: '-5px', color: isMelted ? '#e5e5e7' : '#1d1d1f' }}>
              {isMelted ? "OFFLINE" : `${netEff.toFixed(1)}%`}
            </h2>
          </div>
          <Engine3D efficiency={isMelted ? 0 : netEff} thot={thot} material={material} viewMode={viewMode} isMelted={isMelted} />
        </div>

        {/* RIGHT: TELEMETRY */}
        <div style={{ width: '320px', padding: '40px', borderLeft: '1px solid #f2f2f2' }}>
           <h3 style={sectionLabel}>Live Telemetry</h3>
           <StatBox label="Carnot Theoretical" value={`${(carnotLimit * 100).toFixed(2)}%`} />
           <StatBox label="Thermal Differential" value={`${thot - tcold}K`} />
           <StatBox label="Material Stability" value={`${MATERIALS[material].melt}K Limit`} color={isMelted ? '#ff3b30' : '#1d1d1f'} />
           
           <div style={abstractStyle}>
             <p style={{fontWeight: '700', marginBottom: '8px'}}>Research Abstract:</p>
             <p style={{margin: 0, opacity: 0.8}}>Experimental configuration using <b>{MATERIALS[material].name}</b>. {isMelted ? "Structural integrity compromised—thermal load exceeds molecular bonding threshold." : "Kinetic energy conversion stabilized within adiabatic parameters."}</p>
           </div>
        </div>
      </div>
    </div>
  );
}

// RESTORED STYLING OBJECTS
const sectionLabel = { fontSize: '10px', fontWeight: '800', color: '#86868b', letterSpacing: '1.5px', marginBottom: '20px', textTransform: 'uppercase' };
const miniLabel = { fontSize: '11px', color: '#86868b', marginBottom: '8px', display: 'block', fontWeight: '600' };
const selectStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e5e7', background: '#fff', fontSize: '13px' };
const presetBtnStyle = { padding: '6px 16px', borderRadius: '20px', border: '1px solid #e5e5e7', backgroundColor: '#fff', fontSize: '11px', fontWeight: '500', cursor: 'pointer' };
const toggleBtnStyle = { width: '100%', padding: '14px', background: '#1d1d1f', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '12px', letterSpacing: '0.5px' };
const dataTag = { fontSize: '11px', fontWeight: '700', color: '#0066cc', textTransform: 'uppercase', letterSpacing: '1px' };
const abstractStyle = { marginTop: '50px', padding: '20px', backgroundColor: '#f5f5f7', borderRadius: '12px', fontSize: '12px', lineHeight: '1.6' };

const ParameterSlider = ({ label, val, set, min, max, step = 1, unit = "", color = "#0066cc" }) => (
  <div style={{ marginBottom: '25px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
      <span>{label}</span><span style={{ fontWeight: '700', color }}>{val}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => set(+e.target.value)} style={{ width: '100%', accentColor: color }} />
  </div>
);

const StatBox = ({ label, value, color = '#1d1d1f' }) => (
  <div style={{ marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #f2f2f2' }}>
    <p style={{ fontSize: '11px', color: '#86868b', margin: '0 0 5px 0', fontWeight: '600' }}>{label}</p>
    <p style={{ fontSize: '22px', fontWeight: '700', margin: 0, color }}>{value}</p>
  </div>
);