import React, { useMemo } from 'react';

const PVGraph = ({ thot, tcold }) => {
  const padding = 30;
  const width = 300;
  const height = 180;

  const pathData = useMemo(() => {
    const nR = 1.1; 
    const vMin = 10;
    const vMax = 40;
    const points = [];

    const scaleX = (v) => padding + ((v - vMin) / (vMax - vMin)) * (width - 2 * padding);
    const scaleY = (p) => height - padding - (p / 450) * (height - 2 * padding);

    for (let v = vMin; v <= vMax; v++) points.push(`${scaleX(v)},${scaleY((nR * thot) / v)}`);
    for (let v = vMax; v >= vMin; v--) points.push(`${scaleX(v)},${scaleY((nR * tcold) / v)}`);

    return `M ${points.join(' L ')} Z`;
  }, [thot, tcold]);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={width} height={height}>
        <line x1={padding} y1={height - padding} x2={width} y2={height - padding} stroke="#e5e5e7" />
        <line x1={padding} y1={height - padding} x2={padding} y2="0" stroke="#e5e5e7" />
        <path d={pathData} fill="rgba(0, 102, 204, 0.05)" stroke="#0066cc" strokeWidth="2" />
        <text x={width - 15} y={height - 10} fill="#86868b" fontSize="9">V</text>
        <text x={10} y={15} fill="#86868b" fontSize="9">P</text>
      </svg>
      <p style={{ fontSize: '10px', color: '#86868b', marginTop: '10px' }}>Idealized Carnot Cycle Plot</p>
    </div>
  );
};

export default PVGraph;