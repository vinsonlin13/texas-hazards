import React, { useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label,
  Cell
} from 'recharts';
import * as d3 from 'd3';

// Render bar chart that allows users to select counties
const SelectedBarChart = ({ data, selected, colorBy, setSelected, hoveredCounty, clickedCounty, onCountyHover }) => {
  const selectedData = data
    .filter(d => selected.includes(d.COUNTY?.toUpperCase()))
    .map(d => ({
      name: d.COUNTY,
      value: Number(d[colorBy]) || 0
    }))
    .sort((a, b) => b.value - a.value);

  // Color scale for the bars
  const colorScale = d3.scaleSequential()
    .domain([0, 100])
    .interpolator(d3.interpolateBlues);

  // Handle bar click to remove county from selection
  const handleBarClick = (countyName) => {
    const upper = countyName.toUpperCase();
    setSelected(prev => prev.filter(name => name !== upper));
  };

  // Handle clear all button click and add county to selection
  const handleClearAll = () => setSelected([]);
  const handleAddCounty = (name) => {
    const upper = name.toUpperCase();
    const exists = data.some(d => d.COUNTY?.toUpperCase() === upper);
    if (exists && !selected.includes(upper)) {
      setSelected(prev => [upper, ...prev.slice(0, 14)]);
    }
  };

  // Handle keydown event for adding county
  useEffect(() => {
    if (clickedCounty && !selected.includes(clickedCounty)) {
      const exists = data.some(d => d.COUNTY?.toUpperCase() === clickedCounty);
      if (exists) {
        setSelected(prev => [clickedCounty, ...prev.slice(0, 14)]);
      }
    }
  }, [clickedCounty]);

  // Handle mouse leave event to reset hovered county
  return (
    <div style={{
      width: '500px',
      height: '500px',
      marginLeft: '20px',
      marginRight: '140px',
      backgroundColor: '#e0e0e0',
      borderRadius: '10px',
      padding: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ textAlign: 'center', flex: 1 }}>Selected Counties (select up to 15)</h3>
        <button onClick={handleClearAll} style={{
          backgroundColor: '#ff6666',
          border: 'none',
          borderRadius: '5px',
          padding: '5px 10px',
          cursor: 'pointer',
          marginLeft: '10px'
        }}>Clear</button>
      </div>

      <input
        type="text"
        placeholder="Search county..."
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          marginTop: '10px',
          marginBottom: '10px',
          fontSize: '14px'
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const val = e.target.value.trim();
            if (val) {
              handleAddCounty(val);
              e.target.value = '';
            }
          }
        }}
      />

      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={selectedData}
          layout="vertical"
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          onMouseLeave={() => onCountyHover?.(null)}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number">
            <Label value={colorBy === 'RISK_SCORE' ? 'Risk Score' : 'Value'} position="insideBottom" offset={-10} />
          </XAxis>
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ angle: -30, style: { fontStyle: 'italic' } }}
          >
            <Label value="County" angle={-90} position="insideLeft" offset={-5} />
          </YAxis>
          <Tooltip formatter={(value) => value.toFixed(3)} />
          <Bar dataKey="value">
            {selectedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.name?.toUpperCase() === hoveredCounty?.toUpperCase() ? 'orange' : colorScale(entry.value)}
                onMouseEnter={() => onCountyHover?.(entry.name?.toUpperCase())}
                onClick={() => handleBarClick(entry.name)}
                cursor="pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SelectedBarChart;