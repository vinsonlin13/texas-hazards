// Project: Texas County Risk Assessment
import { useEffect, useState } from 'react';
import { loadCSV } from '../utils/parseCSV';
import Map from '../components/Map';
import BarChart from '../components/BarChart';
import AllCountyBarChart from '../components/AllCountyBarChart';
import SelectedBarChart from '../components/SelectedBarChart';
import ScatterPlot from '../components/ScatterPlot';

// Use utility function to load CSV data
export default function HomePage() {
  // State variables
  const [data, setData] = useState([]);
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [clickedCounty, setClickedCounty] = useState(null); // NEW
  const [selectedCounties, setSelectedCounties] = useState([]);
  const [colorBy, setColorBy] = useState('RISK_SCORE');
  const [viewMode, setViewMode] = useState('all');

  // Load CSV data on component mount
  useEffect(() => {
    loadCSV().then(setData).catch(console.error);
  }, []);

  // Handle county click for SelectedBarChart
  const handleCountyClick = (countyName) => {
    const upper = countyName?.toUpperCase();
    if (!upper) return;
    setClickedCounty(upper);
    if (viewMode === 'interactive') {
      setSelectedCounties(prev => {
        const updated = [...new Set([upper, ...prev])];
        return updated.slice(0, 15);
      });
    }
  };  

  if (data.length === 0) return <div>Loading...</div>;

  // Filter data based on selected counties
  return (
    <div>
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

        <label style={{ fontSize: '18px', marginLeft: '30px' }}>
          View mode:&nbsp;
          <select
            onChange={(e) => setViewMode(e.target.value)}
            value={viewMode}
            style={{ padding: '5px', fontSize: '16px' }}
          >
            <option value="all">All Counties</option>
            <option value="top10">Top 10</option>
            <option value="interactive">Interactive</option>
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '20px' }}>
        <Map
          data={data}
          colorBy={colorBy}
          hoveredCounty={hoveredCounty}
          onCountyHover={setHoveredCounty}
          onCountyClick={handleCountyClick}
          viewMode={viewMode}
        />

        {viewMode === 'interactive' && (
          <SelectedBarChart
            data={data}
            selected={selectedCounties}
            colorBy={colorBy}
            setSelected={setSelectedCounties}
            hoveredCounty={hoveredCounty}
            clickedCounty={clickedCounty} // NEW
            onCountyHover={setHoveredCounty}
          />
        )}
      </div>

      {viewMode === 'top10' && (
        <BarChart
          data={data}
          colorBy={colorBy}
          hoveredCounty={hoveredCounty}
          onCountyHover={setHoveredCounty}
        />
      )}

      {viewMode === 'all' && (
        <AllCountyBarChart
          data={data}
          hoveredCounty={hoveredCounty}
          onCountyHover={setHoveredCounty}
        />
      )}

      <ScatterPlot
        data={data}
        colorBy={colorBy}
        hoveredCounty={hoveredCounty}
        onCountyHover={setHoveredCounty}
        onCountyClick={handleCountyClick} // NEW
      />
    </div>
  );
}