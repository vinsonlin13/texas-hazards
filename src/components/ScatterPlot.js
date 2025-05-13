import React from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Tooltip,
  Title,
  Legend,
  PointElement,
  LinearScale
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  Tooltip,
  Title,
  Legend,
  PointElement,
  LinearScale
);

const ScatterPlot = ({ data, colorBy, hoveredCounty, onCountyHover, onCountyClick }) => {
  const filtered = data.filter(
    d => !isNaN(d.RISK_SCORE) && !isNaN(d.RESL_SCORE)
  );

  const chartData = {
    datasets: [
      {
        label: 'Counties',
        data: filtered.map(d => ({
          x: Math.round(d.RESL_SCORE * 100) / 100,
          y: Math.round(d.RISK_SCORE * 100) / 100,
          county: d.COUNTY
        })),
        backgroundColor: filtered.map(d =>
          d.COUNTY?.toUpperCase() === hoveredCounty?.toUpperCase() ? 'orange' : 'rgba(30, 144, 255, 0.6)'
        ),
        borderColor: filtered.map(d =>
          d.COUNTY?.toUpperCase() === hoveredCounty?.toUpperCase() ? 'orange' : 'rgba(30, 144, 255, 1)'
        ),
        pointRadius: filtered.map(d =>
          d.COUNTY?.toUpperCase() === hoveredCounty?.toUpperCase() ? 8 : 5
        ),
        hoverRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: (event, chartElement) => {
      if (chartElement.length > 0) {
        const county = chartElement[0].element.$context.raw.county;
        onCountyHover?.(county.toUpperCase());
      } else {
        onCountyHover?.(null);
      }
    },
    onClick: (event, chartElement) => {
      if (chartElement.length > 0) {
        const county = chartElement[0].element.$context.raw.county;
        onCountyClick?.(county);
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = context.raw;
            return [
              `County: ${point.county}`,
              `Risk Score: ${point.y}`,
              `Resilience Score: ${point.x}`
            ];
          }
        }
      },
      legend: { display: false }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Resilience Score',
          font: { size: 14 }
        },
        min: 0,
        max: 100
      },
      y: {
        title: {
          display: true,
          text: 'Risk Score',
          font: { size: 14 }
        },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="graph-box" style={{ width: '100%', maxWidth: '900px', margin: 'auto' }}>
      <h2 className="graph-title">Texas Counties Risk vs. Resilience Scatterplot</h2>
      <div style={{ width: '100%', height: '500px' }}>
        <Scatter data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ScatterPlot;