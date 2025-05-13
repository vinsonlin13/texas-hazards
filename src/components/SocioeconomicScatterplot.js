'use client';

import { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

export default function SocioeconomicScatterplot({ onCountyHover, hoveredCounty }) {
  const [data, setData] = useState([]);
  const [flatMapping, setFlatMapping] = useState({});
  const [xVar, setXVar] = useState('');
  const svgRef = useRef();
  const tooltipRef = useRef(null);

  function flattenMapping(obj, prefix = '') {
    let result = {};
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string') {
        const lastSegment = prefix.split(' > ').at(-1);
        const cleanedLabel = value === lastSegment ? prefix : `${prefix} > ${value}`;
        result[key] = { code: key, label: cleanedLabel };
      } else if (typeof value === 'object') {
        const newPrefix = prefix ? `${prefix} > ${key}` : key;
        Object.assign(result, flattenMapping(value, newPrefix));
      }
    }
    return result;
  }

  useEffect(() => {
    async function fetchData() {
      const [mappingData, csvData] = await Promise.all([
        d3.json('/data/socioecon_metadata.json'),
        d3.csv('/data/texas_socioecon_data.csv')
      ]);

      const flat = flattenMapping(mappingData);
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

    const width = 450;
    const height = 350;
    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const plotGroup = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => +d[xVar])).nice()
      .range([0, plotWidth]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => +d['Risk_Score'])).nice()
      .range([plotHeight, 0]);

    const xAxis = d3.axisBottom(x).tickSize(-plotHeight).tickPadding(8);
    const yAxis = d3.axisLeft(y).tickSize(-plotWidth).tickPadding(8);

    plotGroup.append('g')
      .attr('transform', `translate(0,${plotHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#888');
    plotGroup.select('g:last-of-type path').style('stroke', '#ccc');
    plotGroup.selectAll('g:last-of-type line').style('stroke', '#ccc');

    plotGroup.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('fill', '#888');
    plotGroup.select('g:nth-of-type(2) path').style('stroke', '#ccc');
    plotGroup.selectAll('g:nth-of-type(2) line').style('stroke', '#ccc');

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
      .attr('r', d => d.County_Name?.toUpperCase() === hoveredCountyName ? 6 : 4)
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
      .attr('y', plotHeight + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#888')
      .text(flatMapping[xVar]?.label || xVar);

    plotGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -plotHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#888')
      .text('Risk Score');

    return () => {
      if (tooltip) tooltip.style('opacity', 0);
    };
  }, [data, xVar, flatMapping, hoveredCounty, onCountyHover]);

  if (!Object.keys(flatMapping).length || !data.columns) return <div>Loading...</div>;

  const availableVariables = Object.values(flatMapping).filter(f => data.columns.includes(f.code));

  return (
    <div className="graph-box" style={{ width: '100%', maxWidth: '500px', margin: 'auto' }}>
      <h2 className="graph-title">Texas Counties Socioeconomic Risk Scatterplot</h2>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ marginRight: '0.5rem', fontSize: '0.9rem' }}>X-axis:</label>
        <select
          value={xVar}
          onChange={e => setXVar(e.target.value)}
          style={{
            fontSize: '0.9rem',
            maxWidth: '100%',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }}
        >
          {availableVariables.map(({ code, label }) => (
            <option key={code} value={code}>
              {label.length > 50 ? label.slice(0, 50) + '...' : label}
            </option>
          ))}
        </select>
      </div>
      <svg ref={svgRef} width={450} height={350}></svg>
    </div>
  );
}