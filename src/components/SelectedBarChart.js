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

const SelectedBarChart = ({
  data,
  selected,
  colorBy,
  setSelected,
  hoveredCounty,
  clickedCounty,
  onCountyHover
}) => {
  const selectedData = data
    .filter(d => selected.includes(d.COUNTY?.toUpperCase()))
    .map(d => ({
      name: d.COUNTY,
      value: Number(d[colorBy]) || 0
    }))
    .sort((a, b) => b.value - a.value);

  const colorScale = d3.scaleSequential()
    .domain([0, 100])
    .interpolator(d3.interpolateBlues);

  const handleBarClick = (countyName) => {
    const upper = countyName.toUpperCase();
    setSelected(prev => prev.filter(name => name !== upper));
  };

  const handleClearAll = () => setSelected([]);
  const handleAddCounty = (name) => {
    const upper = name.toUpperCase();
    const exists = data.some(d => d.COUNTY?.toUpperCase() === upper);
    if (exists && !selected.includes(upper)) {
      setSelected(prev => [upper, ...prev.slice(0, 14)]);
    }
  };

  useEffect(() => {
    if (clickedCounty && !selected.includes(clickedCounty)) {
      const exists = data.some(d => d.COUNTY?.toUpperCase() === clickedCounty);
      if (exists) {
        setSelected(prev => [clickedCounty, ...prev.slice(0, 14)]);
      }
    }
  }, [clickedCounty]);

  return (
    <div className="graph-box" style={{ maxWidth: '700px', margin: 'auto' }}>
      <h2 className="graph-title">Interactive Selected Counties Bar Chart</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Selected (max 15)</h3>
        <button
          onClick={handleClearAll}
          style={{
            backgroundColor: '#e57373',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 10px',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>

      <input
        type="text"
        placeholder="Add county..."
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          marginBottom: '12px',
          fontSize: '0.9rem',
          boxSizing: 'border-box'
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

      <div style={{ width: '100%', height: '420px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={selectedData}
            layout="vertical"
            margin={{ top: 20, right: 20, left: 30, bottom: 20 }}
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
              tick={{ fontSize: 12, angle: -20 }}
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
    </div>
  );
};

export default SelectedBarChart;