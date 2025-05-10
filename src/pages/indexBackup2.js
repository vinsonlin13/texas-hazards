import { useEffect, useState } from 'react';
import { loadCSV } from '../utils/parseCSV';
import Map from '../components/Map';
import BarChart from '../components/BarChart';
import ScatterPlot from '../components/ScatterPlot';

export default function HomePage() {
  const [data, setData] = useState([]);
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [colorBy, setColorBy] = useState('RISK_SCORE');

  useEffect(() => {
    loadCSV().then(setData).catch(console.error);
  }, []);

  if (data.length === 0) return <div>Loading...</div>;

  return (
    <div>
      {/* Banner */}
      <div style={{
        backgroundColor: '#5C8DFF',
        padding: '20px',
        textAlign: 'center',
        color: '#ffffff',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h1>Texas County Risk Assessment</h1>
        <label style={{ fontSize: '18px', marginRight: '10px' }}>
          Color map by:&nbsp;
          <select
            onChange={(e) => setColorBy(e.target.value)}
            value={colorBy}
            style={{ padding: '5px', fontSize: '16px' }}
          >
            <option value="RISK_SCORE">Risk Score</option>
            <option value="POPULATION">Population</option>
          </select>
        </label>
      </div>

      {/* Interactive Map */}
      <Map
        data={data}
        colorBy={colorBy}
        hoveredCounty={hoveredCounty}
        onCountyHover={setHoveredCounty}
      />

      {/* Bar chart (only for risk score) */}
      {colorBy === 'RISK_SCORE' && (
        <BarChart
          data={data}
          hoveredCounty={hoveredCounty}
          onCountyHover={setHoveredCounty}
        />
      )}

      {/* Scatter Plot (always rendered) */}
      <ScatterPlot
        data={data}
        colorBy={colorBy}
        hoveredCounty={hoveredCounty}
        onCountyHover={setHoveredCounty}
      />
    </div>
  );
}