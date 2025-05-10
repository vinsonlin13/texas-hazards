'use client';

import { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

export default function SocioeconomicScatterplot({ onCountyHover, hoveredCounty }) {
  const [data, setData] = useState([]);
  const [mapping, setMapping] = useState({});
  const [flatMapping, setFlatMapping] = useState({});
  const [xVar, setXVar] = useState('');
  const svgRef = useRef();
  const tooltipRef = useRef(null);

  function flattenMapping(obj, prefix = '') {
    let res = {};
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        res[obj[key]] = { code: key, label: prefix ? `${prefix} > ${obj[key]}` : obj[key] };
      } else if (typeof obj[key] === 'object') {
        Object.assign(res, flattenMapping(obj[key], prefix ? `${prefix} > ${key}` : key));
      }
    }
    return res;
  }

  useEffect(() => {
    async function fetchData() {
      const [mappingData, csvData] = await Promise.all([
        d3.json('/Data/socioecon_metadata.json'),
        d3.csv('/Data/texas_socioecon_data.csv')
      ]);

      const flat = flattenMapping(mappingData);
      setMapping(mappingData);
      setFlatMapping(flat);

      const availableVars = Object.values(flat).filter(f => csvData.columns.includes(f.code));
      if (availableVars.length > 0) {
        setXVar(availableVars[0].code);
      }

      setData(csvData);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!data.length || !xVar) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 600;
    const margin = { top: 50, right: 50, bottom: 70, left: 70 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const plotGroup = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => +d[xVar])).nice()
      .range([0, plotWidth]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => +d['Risk_Score'])).nice()
      .range([plotHeight, 0]);

    plotGroup.append('g')
      .attr('transform', `translate(0,${plotHeight})`)
      .call(d3.axisBottom(x));

    plotGroup.append('g')
      .call(d3.axisLeft(y));

    // Tooltip
    if (!tooltipRef.current) {
      tooltipRef.current = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background', 'white')
        .style('border', '1px solid black')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('opacity', 0);
    }

    const tooltip = tooltipRef.current;

    const hoveredCountyName = hoveredCounty?.toUpperCase();

    plotGroup.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(+d[xVar]))
      .attr('cy', d => y(+d['Risk_Score']))
      .attr('r', d => d.County_Name?.toUpperCase() === hoveredCountyName ? 8 : 5)
      .attr('fill', d => d.County_Name?.toUpperCase() === hoveredCountyName ? 'orange' : 'steelblue')
      .attr('opacity', 0.7)
      .on('mouseover', (event, d) => {
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.County_Name}</strong><br/>
            ${flatMapping[xVar]?.label || xVar}: ${(+d[xVar]).toFixed(2)}<br/>
            Risk Score: ${(+d['Risk_Score']).toFixed(2)}
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');

        onCountyHover?.(d.County_Name);
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
        onCountyHover?.(null);
      });

    plotGroup.append('text')
      .attr('x', plotWidth / 2)
      .attr('y', plotHeight + 50)
      .attr('text-anchor', 'middle')
      .text(flatMapping[xVar]?.label || xVar);

    plotGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -plotHeight / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .text('Risk Score');
  }, [data, xVar, flatMapping, hoveredCounty, onCountyHover]);

  if (!Object.keys(flatMapping).length) return <div>Loading...</div>;

  const availableVariables = Object.values(flatMapping).filter(f => data.columns.includes(f.code));

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Socioeconomic Risk Scatterplot</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>X-axis:</label>
        <select
          value={xVar}
          onChange={e => setXVar(e.target.value)}
          style={{ maxHeight: '300px', overflowY: 'auto' }}
        >
          {availableVariables.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <svg ref={svgRef} width={800} height={600}></svg>
    </div>
  );
}