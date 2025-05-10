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

  const normalize = (value, min, max) => {
    if (value <= 0) return 0;
    const logMin = Math.log(min);
    const logMax = Math.log(max);
    const logVal = Math.log(value);
    return ((logVal - logMin) / (logMax - logMin)) * 100;
  };

  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then(usTopo => {
        const counties = feature(usTopo, usTopo.objects.counties).features;
        const texasCounties = counties.filter(d => d.id.startsWith('48')); // Texas FIPS: 48
        setGeographies(texasCounties);
      });
  }, []);

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
    <div style={{ maxWidth: '1000px', margin: 'auto', display: 'flex', justifyContent: 'space-between' }}>
      <div
        style={{
          backgroundColor: 'rgba(128, 128, 128, 0.2)',
          padding: '20px',
          borderRadius: '10px',
          flex: 1
        }}
      >
        <h2 style={{
          textAlign: 'center',
          fontWeight: 'bold',
          textDecoration: 'underline'
        }}>
          Texas Counties Heatmap ({colorBy})
        </h2>

        <div style={{ flex: 1, paddingRight: '20px' }}>
          <div style={{ overflow: 'hidden' }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                center: [-99.5, 31.0],
                scale: 3000
              }}
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
                        style={{
                          default: { outline: 'none' },
                          hover: { fill: '#2a9df4', outline: 'none' },
                          pressed: { outline: 'none' }
                        }}
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
              background: `linear-gradient(to right, ${[...Array(11).keys()]
                .map(i => colorScale(i * 10))
                .join(', ')})`,
              border: '1px solid #aaa'
            }} />
            <span style={{ marginLeft: 8 }}>100</span>
          </div>
        </div>
      </div>

      {/* Hover Data Section */}
      <div style={{ width: '300px', padding: '20px', borderLeft: '1px solid #ddd' }}>
        {hoveredCounty && hoveredData && (
          <div style={{
            backgroundColor: 'rgba(240, 240, 240, 0.9)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            fontWeight: 'bold'
          }}>
            <div style={{
              backgroundColor: 'rgba(0, 102, 204, 0.6)',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '10px',
              fontSize: '22px'
            }}>
              County: {hoveredCounty}
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 165, 0, 0.6)',
              padding: '10px',
              borderRadius: '5px',
              fontSize: '18px'
            }}>
              {colorBy === 'RISK_SCORE' ? (
                `Risk Score: ${hoveredData.RISK_SCORE?.toFixed(2)}`
              ) : (
                <>
                  Population: {Number(hoveredData.POPULATION).toLocaleString()}<br />
                  Index: {Number(roundedValue).toFixed(1)} / 100
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tooltip next to cursor */}
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
            {colorBy === 'RISK_SCORE' ? (
              `Risk Score: ${hoveredData.RISK_SCORE?.toFixed(2)}`
            ) : (
              <>
                Population: {Number(hoveredData.POPULATION).toLocaleString()}<br />
                Index: {Number(roundedValue).toFixed(1)} / 100
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;