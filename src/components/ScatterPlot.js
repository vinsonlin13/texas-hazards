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

ChartJS.register(
  Tooltip,
  Title,
  Legend,
  PointElement,
  LinearScale
);

const ScatterPlot = ({ data, colorBy, hoveredCounty, onCountyHover }) => {
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
            d.COUNTY?.toUpperCase() === hoveredCounty?.toUpperCase()
            ? 'orange' : 'rgba(30, 144, 255, 0.6)'
        ),
        borderColor: filtered.map(d =>
            d.COUNTY?.toUpperCase() === hoveredCounty?.toUpperCase()
            ? 'orange' : 'rgba(30, 144, 255, 1)'
        ),
        pointRadius: filtered.map(d =>
            d.COUNTY?.toUpperCase() === hoveredCounty?.toUpperCase()
            ? 8 : 5
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
        onCountyHover?.(county);
      } else {
        onCountyHover?.(null);
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
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Risk vs. Resilience Score (Texas Counties)',
        font: {
          size: 18
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Resilience Score'
        },
        min: 0,
        max: 100
      },
      y: {
        title: {
          display: true,
          text: 'Risk Score'
        },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '900px',
      height: '500px',
      margin: '40px auto',
      backgroundColor: '#f8f8f8',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
    }}>
      <Scatter data={chartData} options={options} />
    </div>
  );
};

export default ScatterPlot;