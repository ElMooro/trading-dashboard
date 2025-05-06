import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ReferenceLine
} from 'recharts';

// Mock data - in a real app, this would come from your API
const mockData = [
  { date: '2024-01', GDP: 21.5, Inflation: 3.2, Unemployment: 4.1 },
  { date: '2024-02', GDP: 21.8, Inflation: 3.3, Unemployment: 4.0 },
  { date: '2024-03', GDP: 22.0, Inflation: 3.4, Unemployment: 3.9 },
  { date: '2024-04', GDP: 22.1, Inflation: 3.6, Unemployment: 3.8 },
  { date: '2024-05', GDP: 22.3, Inflation: 3.7, Unemployment: 3.7 },
  { date: '2024-06', GDP: 22.5, Inflation: 3.8, Unemployment: 3.7 },
  { date: '2024-07', GDP: 22.7, Inflation: 3.9, Unemployment: 3.6 },
  { date: '2024-08', GDP: 22.9, Inflation: 4.0, Unemployment: 3.5 },
  { date: '2024-09', GDP: 23.1, Inflation: 4.1, Unemployment: 3.5 },
  { date: '2024-10', GDP: 23.3, Inflation: 4.2, Unemployment: 3.4 },
  { date: '2024-11', GDP: 23.5, Inflation: 4.3, Unemployment: 3.4 },
  { date: '2024-12', GDP: 23.8, Inflation: 4.4, Unemployment: 3.3 },
];

// Available indicators
const availableIndicators = [
  { id: 'GDP', name: 'GDP', color: '#8884d8', yAxisId: 'left' },
  { id: 'Inflation', name: 'Inflation Rate', color: '#ff7300', yAxisId: 'left' },
  { id: 'Unemployment', name: 'Unemployment Rate', color: '#82ca9d', yAxisId: 'left' },
];

const GlobalEconomicChartBuilder = () => {
  const [selectedIndicators, setSelectedIndicators] = useState(['GDP', 'Inflation']);
  const [useDualAxis, setUseDualAxis] = useState(false);
  const [timeframe, setTimeframe] = useState('1Y');

  // Save chart configuration to localStorage
  useEffect(() => {
    const saveConfig = () => {
      const config = {
        selectedIndicators,
        useDualAxis,
        timeframe,
      };
      localStorage.setItem('chartConfig', JSON.stringify(config));
    };
    saveConfig();
  }, [selectedIndicators, useDualAxis, timeframe]);

  // Load chart configuration from localStorage
  useEffect(() => {
    const loadConfig = () => {
      const config = localStorage.getItem('chartConfig');
      if (config) {
        const { selectedIndicators: savedIndicators, useDualAxis: savedDualAxis, timeframe: savedTimeframe } = JSON.parse(config);
        setSelectedIndicators(savedIndicators);
        setUseDualAxis(savedDualAxis);
        setTimeframe(savedTimeframe);
      }
    };
    loadConfig();
  }, []);

  // Handle indicator selection
  const handleIndicatorToggle = (indicatorId) => {
    if (selectedIndicators.includes(indicatorId)) {
      setSelectedIndicators(selectedIndicators.filter(id => id !== indicatorId));
    } else {
      setSelectedIndicators([...selectedIndicators, indicatorId]);
    }
  };

  // Export chart as PNG
  const exportAsPNG = () => {
    // This is a placeholder for actual export functionality
    alert('Chart would be exported as PNG - implementation would use html2canvas or similar library');
  };

  return (
    <div className="chart-builder">
      <div className="chart-controls">
        <div className="indicator-selector">
          <h3>Select Indicators</h3>
          <div className="indicators">
            {availableIndicators.map(indicator => (
              <label key={indicator.id} className="indicator-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIndicators.includes(indicator.id)}
                  onChange={() => handleIndicatorToggle(indicator.id)}
                />
                <span style={{ color: indicator.color }}>{indicator.name}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="chart-options">
          <div className="dual-axis-toggle">
            <label>
              <input
                type="checkbox"
                checked={useDualAxis}
                onChange={() => setUseDualAxis(!useDualAxis)}
              />
              Enable Dual Y-Axis
            </label>
          </div>
          
          <div className="timeframe-selector">
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
              <option value="5Y">5 Years</option>
            </select>
          </div>
          
          <button onClick={exportAsPNG} className="export-btn">
            Export as PNG
          </button>
        </div>
      </div>
      
      <div className="chart-container" style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={mockData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            {useDualAxis && <YAxis yAxisId="right" orientation="right" />}
            <Tooltip />
            <Legend />
            <Brush dataKey="date" height={30} stroke="#8884d8" />
            
            {availableIndicators
              .filter(indicator => selectedIndicators.includes(indicator.id))
              .map(indicator => (
                <Line
                  key={indicator.id}
                  type="monotone"
                  dataKey={indicator.id}
                  stroke={indicator.color}
                  yAxisId={useDualAxis && indicator.id !== selectedIndicators[0] ? 'right' : 'left'}
                  activeDot={{ r: 8 }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GlobalEconomicChartBuilder;
