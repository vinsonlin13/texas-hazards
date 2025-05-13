import React, { useEffect, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography
} from 'react-simple-maps';
import { feature } from 'topojson-client';
import * as d3 from 'd3';

const geoUrl = '/data/counties-10m.json';

const Map = ({ data, colorBy = 'RISK_SCORE', onCountyHover, hoveredCounty, onCountyClick }) => {
  const [geographies, setGeographies] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [tooltipColor, setTooltipColor] = useState('rgba(0, 102, 204, 0.6)');
  const [tooltipTextColor, setTooltipTextColor] = useState('#000000');

  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then(usTopo => {
        const counties = feature(usTopo, usTopo.objects.counties).features;
        const texasCounties = counties.filter(d => d.id.startsWith('48'));
        setGeographies(texasCounties);
      });
  }, []);

  const normalize = (value, min, max) => {
    if (value <= 0) return 0;
    const logMin = Math.log(min);
    const logMax = Math.log(max);
    const logVal = Math.log(value);
    return ((logVal - logMin) / (logMax - logMin)) * 100;
  };

  const valueMap = {};
  let popMin = Infinity, popMax = -Infinity;

  if (colorBy === 'POPULATION') {
    data.forEach(d => {
      if (!isNaN(d.POPULATION)) {
        if (d.POPULATION < popMin) popMin = d.POPULATION;
        if (d.POPULATION > popMax) popMax = d.POPULATION;
      }
    });
  }

  data.forEach(d => {
    const county = d.COUNTY?.toUpperCase();
    if (colorBy === 'POPULATION') {
      valueMap[county] = normalize(d.POPULATION, popMin, popMax);
    } else {
      valueMap[county] = d[colorBy];
    }
  });

  const colorScale = d3.scaleSequential()
    .domain([0, 100])
    .interpolator(d3.interpolateBlues);

  const calculateLuminance = (color) => {
    const d3Color = d3.color(color);
    if (!d3Color) return 0;
    const rgb = d3Color.rgb();
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const handleMouseMove = (event) => {
    setCursorPosition({ x: event.clientX + 10, y: event.clientY + 10 });
  };

  const hoveredData = data.find(d => d.COUNTY?.toUpperCase() === hoveredCounty);
  const roundedValue = hoveredData
    ? (colorBy === 'POPULATION'
        ? normalize(hoveredData.POPULATION, popMin, popMax)
        : hoveredData[colorBy]
      )?.toFixed(2)
    : null;

  const textColor = calculateLuminance(tooltipColor) < 0.5 ? '#FFFFFF' : '#000000';

  return (
    <div className="graph-box" style={{ width: '100%', maxWidth: '1000px', margin: 'auto' }}>
      <h2 className="graph-title">Texas Counties Heatmap ({colorBy})</h2>
      <div style={{ overflow: 'hidden' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [-99.5, 31.0], scale: 3000 }}
          width={1000}
          height={800}
        >
          <Geographies geography={{ type: 'FeatureCollection', features: geographies }}>
            {({ geographies }) =>
              geographies.map(geo => {
                const countyName = geo.properties.name?.toUpperCase();
                const value = valueMap[countyName];
                const isHovered = countyName === hoveredCounty?.toUpperCase();
                const fillColor = isHovered ? '#FF9900' : (value ? colorScale(value) : '#EEE');
                const luminance = calculateLuminance(fillColor);
                const textColor = luminance < 0.5 ? '#FFFFFF' : '#000000';

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#FFF"
                    onMouseEnter={() => {
                      setTooltipColor(fillColor);
                      setTooltipTextColor(textColor);
                      onCountyHover?.(countyName);
                    }}
                    onMouseLeave={() => {
                      setTooltipColor('rgba(0, 102, 204, 0.6)');
                      setTooltipTextColor('#000000');
                      onCountyHover?.(null);
                    }}
                    onMouseMove={handleMouseMove}
                    onClick={() => onCountyClick?.(countyName)}
                    // style={{
                    //   default: { outline: 'none' },
                    //   hover: { fill: '#2a9df4', outline: 'none' },
                    //   pressed: { outline: 'none' }
                    // }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: 8 }}>0</span>
        <div style={{
          flex: 1,
          height: '20px',
          background: `linear-gradient(to right, ${[...Array(11).keys()].map(i => colorScale(i * 10)).join(', ')})`,
          border: '1px solid #aaa'
        }} />
        <span style={{ marginLeft: 8 }}>100</span>
      </div>

      {hoveredCounty && hoveredData && (
        <div
          style={{
            position: 'absolute',
            top: cursorPosition.y,
            left: cursorPosition.x,
            backgroundColor: tooltipColor,
            color: tooltipTextColor,
            padding: '8px',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <div>County: {hoveredCounty}</div>
          <div>
            {colorBy === 'RISK_SCORE'
              ? `Risk Score: ${hoveredData.RISK_SCORE?.toFixed(2)}`
              : <>
                  Population: {Number(hoveredData.POPULATION).toLocaleString()}<br />
                  Index: {Number(roundedValue).toFixed(1)} / 100
                </>
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;