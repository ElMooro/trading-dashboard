import React, { useState, useEffect } from 'react';
import { fetchEconomicIndicators } from '../services/fredApiService';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Brush, ReferenceLine
} from 'recharts';
import { RefreshCw, Download } from 'lucide-react';

// Sample economic indicators
const INDICATORS = [
  { id: 'gdp', name: 'GDP Growth Rate', color: '#4CAF50', axis: 'left' },
  { id: 'inflation', name: 'Inflation Rate', color: '#FF5722', axis: 'left' },
  { id: 'unemployment', name: 'Unemployment Rate', color: '#2196F3', axis: 'left' },
  { id: 'interest', name: 'Interest Rate', color: '#9C27B0', axis: 'right' },
  { id: 'debt', name: 'Public Debt to GDP', color: '#FFC107', axis: 'right' },
  { id: 'balance', name: 'Trade Balance', color: '#795548', axis: 'right' },
];

// Sample mock data - used as fallback if API fails
const generateMockData = (startYear = 2018, months = 60) => {
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < months; i++) {
    const date = new Date(startYear, 0, 1);
    date.setMonth(date.getMonth() + i);
    
    // Don't generate future data beyond current date
    if (date > now) break;
    
    const entry = {
      date: date.toISOString().slice(0, 7), // YYYY-MM format
      gdp: (Math.sin(i / 10) * 3 + Math.random() * 0.5).toFixed(2),
      inflation: (Math.cos(i / 12) * 2 + 2 + Math.random() * 0.3).toFixed(2),
      unemployment: (Math.sin(i / 8) * 1.5 + 4 + Math.random() * 0.2).toFixed(1),
      interest: (Math.cos(i / 20) * 1 + 2 + Math.random() * 0.1).toFixed(2),
      debt: (Math.sin(i / 30) * 10 + 80 + Math.random() * 2).toFixed(1),
      balance: (Math.cos(i / 6) * 20 - 5 + Math.random() * 3).toFixed(1),
    };
    data.push(entry);
  }
  
  return data;
};

// Timeframe options
const TIMEFRAMES = [
  { id: '6m', name: '6 Months', months: 6 },
  { id: '1y', name: '1 Year', months: 12 },
  { id: '3y', name: '3 Years', months: 36 },
  { id: '5y', name: '5 Years', months: 60 },
  { id: 'max', name: 'Max', months: 120 },
];

// Chart configurations and save/load functions
const saveChartConfig = (config) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('macro-chart-config', JSON.stringify(config));
  }
};

const loadChartConfig = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('macro-chart-config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load saved chart config', e);
      }
    }
  }
  return null;
};

// Export chart as image
const exportChartAsImage = () => {
  const svg = document.querySelector('.recharts-wrapper svg');
  if (!svg) return;
  
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const pngFile = canvas.toDataURL('image/png');
    
    // Download file
    const downloadLink = document.createElement('a');
    downloadLink.download = 'macro-chart.png';
    downloadLink.href = pngFile;
    downloadLink.click();
  };
  
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
};

const GlobalEconomicChartBuilder = () => {
  // State management
  const [data, setData] = useState([]);
  const [selectedIndicators, setSelectedIndicators] = useState(['gdp', 'inflation']);
  const [timeframe, setTimeframe] = useState('1y');
  const [useDualAxis, setUseDualAxis] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load data on mount and when timeframe or selected indicators change
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Get real data from FRED API
        const fredData = await fetchEconomicIndicators(selectedIndicators, timeframe);
        setData(fredData);
      } catch (error) {
        console.error('Error loading economic data:', error);
        // Fallback to mock data if API fails
        const months = TIMEFRAMES.find(t => t.id === timeframe)?.months || 12;
        const mockData = generateMockData(2018, months);
        setData(mockData);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [timeframe, selectedIndicators]);
  
  // Load saved config on mount
  useEffect(() => {
    const savedConfig = loadChartConfig();
    if (savedConfig) {
      setSelectedIndicators(savedConfig.indicators || ['gdp', 'inflation']);
      setTimeframe(savedConfig.timeframe || '1y');
      setUseDualAxis(savedConfig.useDualAxis !== undefined ? savedConfig.useDualAxis : true);
    }
  }, []);
  
  // Save config when it changes
  useEffect(() => {
    saveChartConfig({
      indicators: selectedIndicators,
      timeframe,
      useDualAxis
    });
  }, [selectedIndicators, timeframe, useDualAxis]);
  
  // Toggle indicator selection
  const toggleIndicator = (indicatorId) => {
    if (selectedIndicators.includes(indicatorId)) {
      setSelectedIndicators(selectedIndicators.filter(id => id !== indicatorId));
    } else {
      setSelectedIndicators([...selectedIndicators, indicatorId]);
    }
  };
  
  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };
  
  // Get indicators for each axis
  const leftAxisIndicators = INDICATORS.filter(
    ind => selectedIndicators.includes(ind.id) && 
    (ind.axis === 'left' || !useDualAxis)
  );
  
  const rightAxisIndicators = INDICATORS.filter(
    ind => selectedIndicators.includes(ind.id) && 
    ind.axis === 'right' && useDualAxis
  );

  // Custom styles (replacing shadcn/ui components with standard HTML/CSS)
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
    buttonActive: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: '1px solid #3b82f6'
    },
    buttonGroup: {
      display: 'flex'
    },
    controlsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '16px'
    },
    controlSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    controlLabel: {
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '4px'
    },
    indicatorGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '8px'
    },
    indicatorItem: {
      padding: '8px',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: '1px solid #e2e8f0',
      fontSize: '14px'
    },
    indicatorItemActive: {
      backgroundColor: '#f8fafc',
      borderColor: '#d1d5db'
    },
    indicatorColor: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      display: 'inline-block'
    },
    timeframeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '4px'
    },
    switchContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '12px'
    },
    switchLabel: {
      fontSize: '14px',
      cursor: 'pointer'
    },
    switch: {
      position: 'relative',
      display: 'inline-block',
      width: '36px',
      height: '20px'
    },
    switchInput: {
      opacity: 0,
      width: 0,
      height: 0
    },
    switchSlider: {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ccc',
      borderRadius: '34px',
      transition: '0.4s'
    },
    switchSliderChecked: {
      backgroundColor: '#3b82f6'
    },
    switchSliderBefore: {
      position: 'absolute',
      content: '""',
      height: '16px',
      width: '16px',
      left: '2px',
      bottom: '2px',
      backgroundColor: 'white',
      borderRadius: '50%',
      transition: '0.4s'
    },
    switchSliderBeforeChecked: {
      transform: 'translateX(16px)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px',
      marginTop: '24px',
      borderTop: '1px solid #e2e8f0',
      paddingTop: '16px'
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
      marginTop: '4px',
      display: 'flex',
      justifyContent: 'space-between'
    },
    statsChange: {
      fontSize: '14px',
      fontWeight: '500'
    },
    changePositive: {
      color: '#16a34a'
    },
    changeNegative: {
      color: '#dc2626'
    },
    changeNeutral: {
      color: '#64748b'
    }
  };
  
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Global Economic Chart Builder</h2>
        <div style={{display: 'flex'}}>
          <button 
            style={styles.button}
            onClick={exportChartAsImage}
          >
            <Download size={16} style={{marginRight: '4px'}} /> Export
          </button>
          <button 
            style={styles.button}
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                const months = TIMEFRAMES.find(t => t.id === timeframe)?.months || 12;
                const mockData = generateMockData(2018, months);
                setData(mockData);
                setIsLoading(false);
              }, 500);
            }}
          >
            <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
          </button>
        </div>
      </div>
      
      <div style={styles.content}>
        {/* Controls Area */}
        <div style={styles.controlsRow}>
          {/* Indicator Selection */}
          <div style={styles.controlSection}>
            <label style={styles.controlLabel}>Indicators</label>
            <div style={styles.indicatorGrid}>
              {INDICATORS.map(indicator => (
                <div 
                  key={indicator.id}
                  style={{
                    ...styles.indicatorItem,
                    ...(selectedIndicators.includes(indicator.id) ? styles.indicatorItemActive : {})
                  }}
                  onClick={() => toggleIndicator(indicator.id)}
                >
                  <div 
                    style={{
                      ...styles.indicatorColor,
                      backgroundColor: indicator.color
                    }}
                  />
                  <span>{indicator.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Timeframe Selection */}
          <div style={styles.controlSection}>
            <label style={styles.controlLabel}>Timeframe</label>
            <div style={styles.timeframeGrid}>
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf.id}
                  style={{
                    ...styles.button,
                    ...(timeframe === tf.id ? styles.buttonActive : {})
                  }}
                  onClick={() => setTimeframe(tf.id)}
                >
                  {tf.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chart Options */}
          <div style={styles.controlSection}>
            <label style={styles.controlLabel}>Chart Options</label>
            <div style={styles.switchContainer}>
              <label style={styles.switchLabel} htmlFor="dual-axis">
                Dual Y-Axis
              </label>
              <label style={styles.switch}>
                <input
                  id="dual-axis"
                  type="checkbox"
                  style={styles.switchInput}
                  checked={useDualAxis}
                  onChange={(e) => setUseDualAxis(e.target.checked)}
                />
                <span style={{
                  ...styles.switchSlider,
                  ...(useDualAxis ? styles.switchSliderChecked : {})
                }}>
                  <span style={{
                    ...styles.switchSliderBefore,
                    ...(useDualAxis ? styles.switchSliderBeforeChecked : {})
                  }}></span>
                </span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Chart Area */}
        <div style={{height: '384px', marginTop: '24px'}}>
          {isLoading ? (
            <div style={{
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <RefreshCw size={32} style={{
                animation: 'spin 1s linear infinite',
                color: '#94a3b8'
              }} />
              <span style={{marginLeft: '8px', color: '#64748b'}}>Loading data...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.7} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  padding={{ left: 10, right: 10 }}
                />
                
                {/* Left Y-Axis */}
                {leftAxisIndicators.length > 0 && (
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    tickFormatter={(value) => `${value}%`}
                    domain={['auto', 'auto']}
                  />
                )}
                
                {/* Right Y-Axis (if dual axis is enabled) */}
                {rightAxisIndicators.length > 0 && (
                  <YAxis 
                    yAxisId="right"
                    orientation="right" 
                    tickFormatter={(value) => `${value}${
                      rightAxisIndicators.some(i => i.id === 'debt') ? '%' : ''
                    }`}
                    domain={['auto', 'auto']}
                  />
                )}
                
                <Tooltip 
                  formatter={(value, name) => {
                    const indicator = INDICATORS.find(ind => ind.id === name);
                    return [`${value}${
                      ['debt', 'gdp', 'inflation', 'unemployment', 'interest'].includes(name) ? '%' : ''
                    }`, indicator?.name || name];
                  }}
                  labelFormatter={formatDate}
                />
                
                <Legend 
                  formatter={(value) => {
                    const indicator = INDICATORS.find(ind => ind.id === value);
                    return indicator?.name || value;
                  }}
                />
                
                {/* Left Axis Lines */}
                {leftAxisIndicators.map(indicator => (
                  <Line
                    key={indicator.id}
                    type="monotone"
                    dataKey={indicator.id}
                    stroke={indicator.color}
                    yAxisId="left"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
                
                {/* Right Axis Lines */}
                {rightAxisIndicators.map(indicator => (
                  <Line
                    key={indicator.id}
                    type="monotone"
                    dataKey={indicator.id}
                    stroke={indicator.color}
                    yAxisId="right"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
                
                {/* Brush for zooming and panning */}
                <Brush 
                  dataKey="date" 
                  height={30} 
                  stroke="#8884d8"
                  tickFormatter={formatDate}
                  startIndex={data.length > 12 ? data.length - 12 : 0}
                />
                
                {/* Reference line for zero */}
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" yAxisId="left" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Data Stats Section */}
        {!isLoading && data.length > 0 && (
          <div style={styles.statsGrid}>
            {selectedIndicators.map(indId => {
              const indicator = INDICATORS.find(i => i.id === indId);
              if (!indicator) return null;
              
              // Calculate stats
              const values = data.map(d => parseFloat(d[indId]));
              const latest = values[values.length - 1];
              const previous = values[values.length - 2] || 0;
              const change = latest - previous;
              const changePercent = previous ? (change / previous) * 100 : 0;
              
              return (
                <div key={indId} style={styles.statsCard}>
                  <h3 style={styles.statsLabel}>
                    {indicator.name}
                  </h3>
                  <div style={styles.statsValue}>
                    <div>
                      {latest}
                      {['debt', 'gdp', 'inflation', 'unemployment', 'interest'].includes(indId) ? '%' : ''}
                    </div>
                    <div style={{
                      ...styles.statsChange,
                      ...(change > 0 
                        ? styles.changePositive 
                        : change < 0 
                        ? styles.changeNegative 
                        : styles.changeNeutral)
                    }}>
                      {change > 0 ? '↑' : change < 0 ? '↓' : '−'} 
                      {Math.abs(changePercent).toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Adding a style for spin animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}} />
    </div>
  );
};

export default GlobalEconomicChartBuilder;