import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Label
} from 'recharts';

const AllCountyBarChart = ({ data, hoveredCounty, onCountyHover }) => {
  const sorted = [...data]
    .filter(d => !isNaN(d.RISK_SCORE))
    .sort((a, b) => a.RISK_SCORE - b.RISK_SCORE);

  return (
    <div className="graph-box">
      <h2 className="graph-title">All Texas Counties Sorted by Risk Score (Ascending)</h2>
      <ResponsiveContainer width="100%" height={600}>
        <BarChart
          data={sorted}
          // margin={{ top: 20, right: 30, left: 30, bottom: 50 }}
          onMouseLeave={() => onCountyHover?.(null)}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="COUNTY" tick={false} axisLine={false}>
            <Label value="Counties" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis domain={[0, 100]}>
            <Label value="Risk Score" angle={-90} position="insideLeft" />
          </YAxis>
          <Tooltip
            formatter={(value) => value.toFixed(2)}
            labelFormatter={(label) => `County: ${label}`}
          />
          <Bar dataKey="RISK_SCORE">
            {sorted.map((entry, index) => (
              <Cell
                key={`bar-${index}`}
                fill={entry.COUNTY?.toUpperCase() === hoveredCounty?.toUpperCase() ? 'orange' : '#3b82f6'}
                onMouseEnter={() => onCountyHover?.(entry.COUNTY?.toUpperCase())}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllCountyBarChart;