import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';


const RiskBarChart = ({ data, colorBy = 'RISK_SCORE', hoveredCounty, onCountyHover }) => {
  const sortedHigh = [...data]
    .filter(d => !isNaN(d.RISK_SCORE))
    .sort((a, b) => b.RISK_SCORE - a.RISK_SCORE)
    .slice(0, 10);


  const sortedLow = [...data]
    .filter(d => !isNaN(d.RISK_SCORE))
    .sort((a, b) => a.RISK_SCORE - b.RISK_SCORE)
    .slice(0, 10);


  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { COUNTY, RISK_SCORE } = payload[0].payload;
      return (
        <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
          <h4>{COUNTY}</h4>
          <p>Risk Score: {RISK_SCORE.toFixed(3)}</p>
        </div>
      );
    }
    return null;
  };


  const CustomLegend = ({ payload }) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
      {payload.map((entry, index) => (
        <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: entry.color,
              marginRight: 6,
              borderRadius: 2
            }}
          />
          <span style={{ color: '#000' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );


  const renderBar = (dataset, title, color) => (
    <div style={{
      backgroundColor: '#f0f0f0',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '900px',
      width: '48%'
    }}>
      <h3 style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', color: '#333' }}>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={dataset}
          margin={{ top: 40, right: 30, left: 40, bottom: 80 }}
          onMouseLeave={() => onCountyHover?.(null)}
        >
          <CartesianGrid strokeDasharray="3 3" />
         
          {/* X-Axis with Label, adjusted position */}
          <XAxis
            dataKey="COUNTY"
            tick={{ angle: -45, textAnchor: 'end', fontSize: 12 }}
            height={120}
            interval={0}
            minTickGap={0}
            label={{
              value: 'Counties',
              position: 'insideBottom',
              offset: 30, // Adjust this offset to move the label up
              style: { textAnchor: 'middle', fontSize: 14, fontWeight: 'bold', fill: '#333' }
            }}
          />
         
          {/* Y-Axis with Label */}
          <YAxis
            label={{
              value: 'Risk Scores',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: 14, fontWeight: 'bold', fill: '#333' }
            }}
          />
         
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Bar dataKey="RISK_SCORE" fill={color}>
            {dataset.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={entry.COUNTY?.toUpperCase() === hoveredCounty?.toUpperCase() ? 'orange' : color}
                onMouseEnter={() => onCountyHover?.(entry.COUNTY?.toUpperCase())}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );


  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', padding: '20px' }}>
      {renderBar(sortedHigh, 'Top 10 Riskiest Counties', '#3b82f6')}
      {renderBar(sortedLow, 'Top 10 Least Risky Counties', '#f97316')}
    </div>
  );
};


export default RiskBarChart;