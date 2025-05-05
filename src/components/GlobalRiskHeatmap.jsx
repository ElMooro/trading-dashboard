import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Risk level definitions
const RISK_LEVELS = {
  LOW: { value: 1, color: '#4CAF50', label: 'Low Risk' },
  MEDIUM: { value: 2, color: '#FFC107', label: 'Medium Risk' },
  HIGH: { value: 3, color: '#FF9800', label: 'High Risk' },
  VERY_HIGH: { value: 4, color: '#F44336', label: 'Very High Risk' },
  CRITICAL: { value: 5, color: '#9C27B0', label: 'Critical Risk' },
};

// Sample data - in a real app this would come from your API
const generateMockCountryRiskData = () => {
  // A sampling of countries and regions for the demo
  const countries = [
    { id: 'USA', name: 'United States', region: 'North America' },
    { id: 'CAN', name: 'Canada', region: 'North America' },
    { id: 'MEX', name: 'Mexico', region: 'North America' },
    { id: 'BRA', name: 'Brazil', region: 'South America' },
    { id: 'ARG', name: 'Argentina', region: 'South America' },
    { id: 'COL', name: 'Colombia', region: 'South America' },
    { id: 'GBR', name: 'United Kingdom', region: 'Europe' },
    { id: 'DEU', name: 'Germany', region: 'Europe' },
    { id: 'FRA', name: 'France', region: 'Europe' },
    { id: 'ITA', name: 'Italy', region: 'Europe' },
    { id: 'ESP', name: 'Spain', region: 'Europe' },
    { id: 'RUS', name: 'Russia', region: 'Europe/Asia' },
    { id: 'CHN', name: 'China', region: 'Asia' },
    { id: 'JPN', name: 'Japan', region: 'Asia' },
    { id: 'IND', name: 'India', region: 'Asia' },
    { id: 'AUS', name: 'Australia', region: 'Oceania' },
    { id: 'NZL', name: 'New Zealand', region: 'Oceania' },
    { id: 'ZAF', name: 'South Africa', region: 'Africa' },
    { id: 'NGA', name: 'Nigeria', region: 'Africa' },
    { id: 'EGY', name: 'Egypt', region: 'Africa' },
  ];
  
  const riskLevelKeys = Object.keys(RISK_LEVELS);
  
  // Generate random risk data for each country
  return countries.map(country => {
    // Weighted random - more likely to be LOW or MEDIUM
    const riskIndex = Math.floor(Math.pow(Math.random(), 1.5) * riskLevelKeys.length);
    const riskLevel = riskLevelKeys[riskIndex];
    
    // Generate some random indicators that are causing the risk
    const indicators = [];
    if (riskIndex >= 1) {
      indicators.push('Inflation Trend');
    }
    if (riskIndex >= 2) {
      indicators.push('Current Account Deficit');
    }
    if (riskIndex >= 3) {
      indicators.push('Political Instability');
    }
    if (riskIndex >= 4) {
      indicators.push('Debt Crisis Probability');
    }
    
    // 10% chance of having a high alert regardless of risk level
    const hasHighAlert = Math.random() < 0.1;
    
    return {
      ...country,
      riskLevel,
      riskValue: RISK_LEVELS[riskLevel].value,
      riskColor: RISK_LEVELS[riskLevel].color,
      riskLabel: RISK_LEVELS[riskLevel].label,
      indicators,
      hasHighAlert,
      alertMessage: hasHighAlert ? 'Significant volatility expected in the next 48 hours' : null,
    };
  });
};

const GlobalRiskHeatmap = () => {
  const mapRef = useRef(null);
  const tooltipRef = useRef(null);
  const [countryData, setCountryData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Styles for the component
  const styles = {
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      width: '100%',
      marginBottom: '20px'
    },
    header: {
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '18px',
      fontWeight: 'bold',
      margin: 0
    },
    content: {
      padding: '16px'
    },
    button: {
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      padding: '6px 12px',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      marginLeft: '8px'
    },
    legendContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center'
    },
    legendColor: {
      width: '16px',
      height: '16px',
      marginRight: '6px',
      borderRadius: '4px'
    },
    legendLabel: {
      fontSize: '14px'
    },
    mapContainer: {
      position: 'relative',
      width: '100%',
      height: '500px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    tooltip: {
      position: 'absolute',
      display: 'none',
      backgroundColor: 'white',
      padding: '12px',
      borderRadius: '6px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      minWidth: '200px',
      pointerEvents: 'none'
    },
    tooltipTitle: {
      fontWeight: 'bold',
      marginBottom: '4px'
    },
    tooltipContent: {
      fontSize: '14px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px',
      marginTop: '16px'
    },
    statsCard: {
      backgroundColor: '#f8fafc',
      borderRadius: '6px',
      padding: '12px'
    },
    statsLabel: {
      fontSize: '12px',
      color: '#64748b'
    },
    statsValue: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginTop: '4px'
    },
    dialog: {
      display: dialogOpen ? 'block' : 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      overflow: 'auto'
    },
    dialogContent: {
      backgroundColor: 'white',
      margin: '100px auto',
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '500px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    dialogHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    dialogTitle: {
      fontSize: '18px',
      fontWeight: 'bold'
    },
    dialogCloseButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer'
    },
    alertTag: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      padding: '2px 8px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-flex',
      alignItems: 'center',
      marginLeft: '8px'
    },
    indicatorList: {
      listStyle: 'none',
      padding: 0,
      margin: '16px 0'
    },
    indicatorItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px'
    },
    alertBox: {
      backgroundColor: '#fee2e2',
      borderRadius: '6px',
      padding: '12px',
      marginTop: '16px',
      borderLeft: '4px solid #b91c1c'
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%'
    },
    spinner: {
      border: '4px solid rgba(0, 0, 0, 0.1)',
      borderLeft: '4px solid #3b82f6',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      animation: 'spin 1s linear infinite'
    }
  };
  
  // Load country data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      // For now, use our mock data generator
      const mockData = generateMockCountryRiskData();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCountryData(mockData);
      setIsLoading(false);
    };
    
    loadData();
  }, []);
  
  // Initialize and draw the map when data is ready
  useEffect(() => {
    if (isLoading || !countryData.length || !mapRef.current) return;
    
    const drawMap = async () => {
      // Clear previous map
      d3.select(mapRef.current).selectAll('*').remove();
      
      try {
        // World map GeoJSON
        // Note: In a real app, you'd load this from a file or API
        // For this demo, we'll use a simplified approach with a world map URL
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
        const worldData = await response.json();
        
        // Set up map dimensions
        const width = mapRef.current.clientWidth;
        const height = 500;
        
        // Create the SVG container
        const svg = d3.select(mapRef.current)
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', `0 0 ${width} ${height}`)
          .attr('style', 'max-width: 100%; height: auto;');
        
        // Create a projection for the map
        const projection = d3.geoNaturalEarth1()
          .scale(width / 5.5)
          .translate([width / 2, height / 2]);
        
        // Create a path generator
        const pathGenerator = d3.geoPath().projection(projection);
        
        // Create a group for all map elements
        const g = svg.append('g');
        
        // Create a tooltip
        const tooltip = d3.select(tooltipRef.current);
        
        // Draw the base map
        g.selectAll('path')
          .data(worldData.features)
          .enter()
          .append('path')
          .attr('d', pathGenerator)
          .attr('fill', (d) => {
            // Find the country in our data
            const country = countryData.find(c => 
              // This matching could be improved for a real application
              // GeoJSON often uses ISO 3166-1 alpha-3 codes
              c.id === d.properties.iso_a3
            );
            
            return country ? country.riskColor : '#e0e0e0';
          })
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5)
          .attr('id', d => `country-${d.properties.iso_a3}`)
          .on('mouseenter', function(event, d) {
            // Find the country in our data
            const country = countryData.find(c => c.id === d.properties.iso_a3);
            
            if (country) {
              d3.select(this)
                .attr('stroke', '#000')
                .attr('stroke-width', 1.5);
              
              // Position and show tooltip
              tooltip
                .style('display', 'block')
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY + 10}px`);
              
              // Update tooltip content
              tooltip.select('.country-name').text(country.name);
              tooltip.select('.risk-level').text(country.riskLabel);
              tooltip.select('.risk-indicators').text(
                country.indicators.length ? country.indicators.join(', ') : 'No significant risk indicators'
              );
            }
          })
          .on('mousemove', function(event) {
            // Move tooltip with mouse
            tooltip
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY + 10}px`);
          })
          .on('mouseleave', function() {
            d3.select(this)
              .attr('stroke', '#fff')
              .attr('stroke-width', 0.5);
            
            // Hide tooltip
            tooltip.style('display', 'none');
          })
          .on('click', function(event, d) {
            // Find the country in our data
            const country = countryData.find(c => c.id === d.properties.iso_a3);
            
            if (country) {
              setSelectedCountry(country);
              setDialogOpen(true);
            }
          });
        
        // Add high alert markers
        const alertCountries = countryData.filter(c => c.hasHighAlert);
        
        g.selectAll('circle')
          .data(alertCountries)
          .enter()
          .append('circle')
          .attr('cx', d => {
            const feature = worldData.features.find(f => f.properties.iso_a3 === d.id);
            if (!feature) return 0;
            // Get the centroid of the country
            const centroid = pathGenerator.centroid(feature);
            return centroid[0];
          })
          .attr('cy', d => {
            const feature = worldData.features.find(f => f.properties.iso_a3 === d.id);
            if (!feature) return 0;
            const centroid = pathGenerator.centroid(feature);
            return centroid[1];
          })
          .attr('r', 8)
          .attr('fill', 'rgba(255, 0, 0, 0.7)')
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)
          .attr('class', 'pulse-circle');
        
        // Add zoom functionality
        const zoom = d3.zoom()
          .scaleExtent([1, 8])
          .on('zoom', (event) => {
            g.attr('transform', event.transform);
          });
        
        svg.call(zoom);
      } catch (error) {
        console.error('Error loading or rendering map:', error);
      }
    };
    
    drawMap();
    
    // Add window resize handler
    const handleResize = () => {
      drawMap();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoading, countryData]);
  
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Global Risk Heatmap</h2>
        <div>
          <button 
            style={styles.button}
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                setCountryData(generateMockCountryRiskData());
                setIsLoading(false);
              }, 800);
            }}
          >
            {isLoading ? (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ccc',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              "Refresh"
            )}
          </button>
        </div>
      </div>
      
      <div style={styles.content}>
        {/* Risk Level Legend */}
        <div style={styles.legendContainer}>
          <span style={{ fontSize: '14px', fontWeight: '500', marginRight: '8px' }}>Risk Levels:</span>
          {Object.entries(RISK_LEVELS).map(([key, data]) => (
            <div key={key} style={styles.legendItem}>
              <div 
                style={{
                  ...styles.legendColor,
                  backgroundColor: data.color
                }}
              />
              <span style={styles.legendLabel}>{data.label}</span>
            </div>
          ))}
          <div style={styles.legendItem}>
            <div 
              style={{
                ...styles.legendColor,
                backgroundColor: 'red',
                animation: 'pulse 1.5s infinite'
              }}
            />
            <span style={styles.legendLabel}>High Alert</span>
          </div>
        </div>
        
        {/* Map Container */}
        <div style={styles.mapContainer}>
          {isLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <span style={{ marginLeft: '12px', color: '#6b7280' }}>Loading map data...</span>
            </div>
          ) : (
            <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
          )}
          
          {/* Tooltip */}
          <div ref={tooltipRef} style={styles.tooltip}>
            <div className="country-name" style={styles.tooltipTitle}></div>
            <div className="risk-level" style={{ marginBottom: '8px' }}></div>
            <div>
              <span style={{ fontWeight: '500' }}>Risk Indicators:</span>
              <div className="risk-indicators" style={{ marginTop: '4px' }}></div>
            </div>
          </div>
        </div>
        
        {/* Bottom metrics */}
        {!isLoading && (
          <div style={styles.statsGrid}>
            <div style={styles.statsCard}>
              <h3 style={styles.statsLabel}>
                High Alert Countries
              </h3>
              <div style={styles.statsValue}>
                {countryData.filter(c => c.hasHighAlert).length}
              </div>
            </div>
            
            <div style={styles.statsCard}>
              <h3 style={styles.statsLabel}>
                High/Critical Risk Regions
              </h3>
              <div style={styles.statsValue}>
                {
                  new Set(
                    countryData
                      .filter(c => ['HIGH', 'VERY_HIGH', 'CRITICAL'].includes(c.riskLevel))
                      .map(c => c.region)
                  ).size
                }
              </div>
            </div>
            
            <div style={styles.statsCard}>
              <h3 style={styles.statsLabel}>
                Global Risk Score
              </h3>
              <div style={styles.statsValue}>
                {
                  (
                    countryData.reduce((sum, c) => sum + c.riskValue, 0) / 
                    (countryData.length * 5) * 100
                  ).toFixed(1)
                }%
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Detail Dialog */}
      <div style={styles.dialog}>
        <div style={styles.dialogContent}>
          <div style={styles.dialogHeader}>
            <h3 style={styles.dialogTitle}>
              {selectedCountry?.name} Risk Analysis
              {selectedCountry?.hasHighAlert && (
                <span style={styles.alertTag}>
                  ⚠️ High Alert
                </span>
              )}
            </h3>
            <button 
              style={styles.dialogCloseButton}
              onClick={() => setDialogOpen(false)}
            >
              ×
            </button>
          </div>
          
          {selectedCountry && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Risk Level</div>
                  <div style={{ color: selectedCountry.riskColor, fontWeight: '500', marginTop: '4px' }}>
                    {selectedCountry.riskLabel}
                  </div>
                </div>
                
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Region</div>
                  <div style={{ fontWeight: '500', marginTop: '4px' }}>{selectedCountry.region}</div>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>Risk Indicators</h4>
                {selectedCountry.indicators.length > 0 ? (
                  <ul style={styles.indicatorList}>
                    {selectedCountry.indicators.map((indicator, i) => (
                      <li key={i} style={styles.indicatorItem}>
                        <span style={{ marginRight: '8px', color: '#6b7280' }}>•</span>
                        <span>{indicator}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#64748b', fontSize: '14px' }}>No significant risk indicators detected</p>
                )}
              </div>
              
              {selectedCountry.hasHighAlert && (
                <div style={styles.alertBox}>
                  <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#b91c1c', marginTop: 0, marginBottom: '4px' }}>
                    ⚠️ Alert Warning
                  </h4>
                  <p style={{ margin: 0, color: '#b91c1c', fontSize: '14px' }}>{selectedCountry.alertMessage}</p>
                </div>
              )}
              
              <div style={{ marginTop: '24px' }}>
                <button 
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    width: '100%',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onClick={() => setDialogOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.7;
          }
        }
        
        .pulse-circle {
          animation: pulse 1.5s infinite;
        }
      `}} />
    </div>
  );
};

export default GlobalRiskHeatmap;