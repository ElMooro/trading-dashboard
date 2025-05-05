import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Sample data
const generateCountryData = () => {
  const countries = [
    'USA', 'Canada', 'Brazil', 'UK', 'France', 'Germany', 'Italy', 'Russia',
    'China', 'Japan', 'India', 'Australia', 'South Africa', 'Mexico', 'Egypt'
  ];
  
  return countries.map(country => ({
    id: country.toLowerCase().replace(/\s/g, ''),
    name: country,
    riskLevel: Math.floor(Math.random() * 10) + 1, // 1-10 risk level
    alert: Math.random() > 0.8, // 20% chance of high alert
    details: {
      gdpGrowth: (Math.random() * 6 - 2).toFixed(1) + '%',
      inflation: (Math.random() * 10).toFixed(1) + '%',
      debt: (Math.random() * 150).toFixed(0) + '% of GDP',
      sentiment: ['Bearish', 'Neutral', 'Bullish'][Math.floor(Math.random() * 3)]
    }
  }));
};

const GlobalRiskHeatmap = () => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [countryData, setCountryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCountryData(generateCountryData());
      setLoading(false);
    }, 1000);
  }, []);
  
  useEffect(() => {
    if (loading || !countryData.length) return;
    
    const width = 800;
    const height = 450;
    
    // Create color scale for risk levels
    const colorScale = d3.scaleSequential()
      .domain([1, 10])
      .interpolator(d3.interpolateReds);
    
    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');
    
    // Create tooltip
    const tooltip = d3.select(tooltipRef.current)
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '10');
    
    // Placeholder for the map (in a real app, this would load a geoJSON)
    // For this demo, we'll just create rectangles for each country
    const rectSize = 80;
    const padding = 10;
    const cols = Math.floor(width / (rectSize + padding));
    
    svg.selectAll('rect')
      .data(countryData)
      .enter()
      .append('rect')
      .attr('x', (d, i) => (i % cols) * (rectSize + padding) + padding)
      .attr('y', (d, i) => Math.floor(i / cols) * (rectSize + padding) + padding)
      .attr('width', rectSize)
      .attr('height', rectSize)
      .attr('rx', 4)
      .attr('fill', d => colorScale(d.riskLevel))
      .attr('stroke', d => d.alert ? '#ffcc00' : 'none')
      .attr('stroke-width', d => d.alert ? 3 : 0)
      .on('mouseover', (event, d) => {
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div class="font-semibold">${d.name}</div>
            <div>Risk Level: ${d.riskLevel}/10</div>
            ${d.alert ? '<div class="text-amber-600 font-bold">⚠️ HIGH ALERT</div>' : ''}
          `);
          
        d3.select(event.currentTarget)
          .attr('stroke', '#2563eb')
          .attr('stroke-width', 2);
          
        // Position the tooltip
        const [x, y] = d3.pointer(event);
        tooltip
          .style('left', `${x + 20}px`)
          .style('top', `${y + 20}px`);
      })
      .on('mousemove', (event) => {
        const [x, y] = d3.pointer(event);
        tooltip
          .style('left', `${x + 20}px`)
          .style('top', `${y + 20}px`);
      })
      .on('mouseout', (event) => {
        tooltip.style('visibility', 'hidden');
        
        d3.select(event.currentTarget)
          .attr('stroke', d => d.alert ? '#ffcc00' : 'none')
          .attr('stroke-width', d => d.alert ? 3 : 0);
      })
      .on('click', (event, d) => {
        setSelectedCountry(d);
      });
    
    // Add country labels
    svg.selectAll('text')
      .data(countryData)
      .enter()
      .append('text')
      .attr('x', (d, i) => (i % cols) * (rectSize + padding) + padding + rectSize/2)
      .attr('y', (d, i) => Math.floor(i / cols) * (rectSize + padding) + padding + rectSize/2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', d => d.riskLevel > 6 ? 'white' : 'black')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => d.name);
    
    // Add alert markers for high-alert countries
    svg.selectAll('circle')
      .data(countryData.filter(d => d.alert))
      .enter()
      .append('circle')
      .attr('cx', (d, i) => {
        const idx = countryData.findIndex(c => c.id === d.id);
        return (idx % cols) * (rectSize + padding) + padding + rectSize - 10;
      })
      .attr('cy', (d, i) => {
        const idx = countryData.findIndex(c => c.id === d.id);
        return Math.floor(idx / cols) * (rectSize + padding) + padding + 10;
      })
      .attr('r', 6)
      .attr('fill', '#ffcc00')
      .attr('stroke', 'white')
      .attr('stroke-width', 1);
      
  }, [loading, countryData]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading heatmap data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Global Risk Heatmap</h2>
      
      <div className="overflow-x-auto">
        <div className="relative">
          <svg ref={svgRef}></svg>
          <div ref={tooltipRef}></div>
        </div>
      </div>
      
      {selectedCountry && (
        <div className="mt-4 p-4 border rounded-lg">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{selectedCountry.name}</h3>
            <button 
              onClick={() => setSelectedCountry(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between mb-1">
              <span>Risk Level:</span>
              <span className={`font-semibold ${
                selectedCountry.riskLevel > 7 ? 'text-red-600' : 
                selectedCountry.riskLevel > 4 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {selectedCountry.riskLevel}/10
              </span>
            </div>
            
            <div className="flex justify-between mb-1">
              <span>GDP Growth:</span>
              <span className="font-semibold">{selectedCountry.details.gdpGrowth}</span>
            </div>
            
            <div className="flex justify-between mb-1">
              <span>Inflation:</span>
              <span className="font-semibold">{selectedCountry.details.inflation}</span>
            </div>
            
            <div className="flex justify-between mb-1">
              <span>Debt:</span>
              <span className="font-semibold">{selectedCountry.details.debt}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Sentiment:</span>
              <span className={`font-semibold ${
                selectedCountry.details.sentiment === 'Bullish' ? 'text-green-600' :
                selectedCountry.details.sentiment === 'Bearish' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {selectedCountry.details.sentiment}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <div>Lower Risk</div>
        <div className="flex gap-1">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="w-5 h-3" 
              style={{ backgroundColor: d3.scaleSequential().domain([0, 9]).interpolator(d3.interpolateReds)(i) }}
            ></div>
          ))}
        </div>
        <div>Higher Risk</div>
      </div>
    </div>
  );
};

export default GlobalRiskHeatmap;
