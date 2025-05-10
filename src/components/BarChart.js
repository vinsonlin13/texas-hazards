import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarChart = ({ data, hoveredCounty, onCountyHover }) => {
  // Sort counties by risk score
  const sorted = useMemo(() => {
    return [...data]
      .filter(d => !isNaN(d.RISK_SCORE))
      .sort((a, b) => a.RISK_SCORE - b.RISK_SCORE);
  }, [data]);

  const chartData = {
    labels: sorted.map(d => d.COUNTY),
    datasets: [
      {
        label: 'Risk Score',
        data: sorted.map(d => d.RISK_SCORE),
        backgroundColor: sorted.map(d =>
            d.COUNTY?.toUpperCase() === hoveredCounty?.toUpperCase()
            ? 'rgba(0, 102, 204, 0.8)' : 'rgba(255, 99, 132, 0.6)'
        ),
        borderColor: sorted.map(d =>
            d.COUNTY?.toUpperCase() === hoveredCounty?.toUpperCase()
            ? 'rgba(0, 102, 204, 1)' : 'rgba(255, 99, 132, 1)'
        ),
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(0, 102, 204, 0.8)',
        hoverBorderColor: 'rgba(0, 102, 204, 1)',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Risk Score: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 90,
          minRotation: 45
        },
        title: {
          display: true,
          text: 'County'
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Risk Score'
        }
      }
    },
    onHover: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const countyName = sorted[index].COUNTY?.toUpperCase();
        onCountyHover?.(countyName);
      } else {
        onCountyHover?.(null);
      }
    }
  };

  return (
    <div style={{ height: '500px', maxWidth: '1000px', margin: '40px auto' }}>
      <h2 style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' }}>
        Risk Scores by County (Ascending)
      </h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;