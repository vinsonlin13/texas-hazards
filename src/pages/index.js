import { useEffect, useState } from 'react';
import { loadCSV } from '../utils/parseCSV';
import AllCountyBarChart from '../components/AllCountyBarChart';
import BarChart from '../components/BarChart';
import Map from '../components/Map';
import ScatterPlot from '../components/ScatterPlot';
import SelectedBarChart from '../components/SelectedBarChart';
import SocioeconomicScatterplot from '../components/SocioeconomicScatterplot';

export default function HomePage() {
  const [data, setData] = useState([]);
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [clickedCounty, setClickedCounty] = useState(null);
  const [selectedCounties, setSelectedCounties] = useState([]);
  const [colorBy, setColorBy] = useState('RISK_SCORE');
  const [viewMode, setViewMode] = useState('all');

  useEffect(() => {
    loadCSV().then(setData).catch(console.error);
  }, []);

  const handleCountyClick = (countyName) => {
    const upper = countyName?.toUpperCase();
    if (!upper) return;
    setClickedCounty(upper);
    if (viewMode === 'interactive') {
      setSelectedCounties((prev) => {
        const updated = [...new Set([upper, ...prev])];
        return updated.slice(0, 15);
      });
    }
  };

  const viewDescriptions = {
    all: 'View a bar chart showing risk scores for all Texas counties.',
    top10: 'Compare the top 10 riskiest and least risky counties in Texas.',
    interactive: 'Select and compare up to 15 counties of your choice by clicking or searching.',
    scatter: 'Explore how risk relates to resilience for each county in a scatterplot.',
    socioeconomic: 'Examine socioeconomic factors against risk scores for Texas counties.'
  };

  if (data.length === 0) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="header-bar">
        <h1>Texas County Risk Assessment</h1>
      </div>

      {/* Description */}
      <div className="description">
        Texas is one of the fastest-growing states in the U.S., attracting a significant number of new residents each year. As climate change continues to escalate, understanding the risks posed by natural disasters becomes increasingly important for both newcomers and policymakers.
      </div>

      {/* Controls */}
      <div className="controls">
        <label>
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

        <label>
          View mode:&nbsp;
          <select
            onChange={(e) => setViewMode(e.target.value)}
            value={viewMode}
            style={{
              padding: '5px',
              fontSize: '16px',
              maxWidth: '220px',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
          >
            <option value="all">All Counties</option>
            <option value="top10">Top 10</option>
            <option value="interactive">Interactive</option>
            <option value="socioeconomic">Socioeconomic Scatterplots</option>
            <option value="scatter">Risk vs Resilience Scatterplot</option>
          </select>
        </label>
      </div>

      {/* View Description */}
      <div className="view-description">{viewDescriptions[viewMode]}</div>

      {/* Views */}
      {viewMode === 'socioeconomic' && (
        <div className="graph-container">
          <div className="graph-box">
            <Map
              data={data}
              colorBy={colorBy}
              hoveredCounty={hoveredCounty}
              onCountyHover={setHoveredCounty}
              onCountyClick={handleCountyClick}
              viewMode={viewMode}
            />
          </div>

          <div className="graph-box">
            <SocioeconomicScatterplot
              hoveredCounty={hoveredCounty}
              onCountyHover={setHoveredCounty}
            />
          </div>
        </div>
      )}

      {viewMode === 'scatter' && (
        <div className="graph-container">
          <div className="graph-box">
            <Map
              data={data}
              colorBy={colorBy}
              hoveredCounty={hoveredCounty}
              onCountyHover={setHoveredCounty}
              onCountyClick={handleCountyClick}
              viewMode={viewMode}
            />
          </div>

          <div className="graph-box">
            <ScatterPlot
              data={data}
              colorBy={colorBy}
              hoveredCounty={hoveredCounty}
              onCountyHover={setHoveredCounty}
              onCountyClick={handleCountyClick}
            />
          </div>
        </div>
      )}

      {['all', 'top10', 'interactive'].includes(viewMode) && (
        <div className="graph-container">
          <div className="graph-box">
            <Map
              data={data}
              colorBy={colorBy}
              hoveredCounty={hoveredCounty}
              onCountyHover={setHoveredCounty}
              onCountyClick={handleCountyClick}
              viewMode={viewMode}
            />
          </div>

          <div className="graph-box">
            {viewMode === 'interactive' && (
              <SelectedBarChart
                data={data}
                selected={selectedCounties}
                colorBy={colorBy}
                setSelected={setSelectedCounties}
                hoveredCounty={hoveredCounty}
                clickedCounty={clickedCounty}
                onCountyHover={setHoveredCounty}
              />
            )}

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
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer-bar">
        Source: <a href="https://hazards.fema.gov/nri/" target="_blank" rel="noopener noreferrer">FEMA National Risk Index</a>
      </footer>
    </div>
  );
}