import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, Brush, ReferenceLine 
} from 'recharts';

// Sample data for demonstration
const generateSignalData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  
  return months.map((month, index) => {
    const randomValue = Math.random() * 100;
    let signal = null;
    
    // Randomly place signals
    if (index === 2) signal = { type: 'buy', reason: 'Strong bullish divergence detected' };
    if (index === 5) signal = { type: 'sell', reason: 'Overbought conditions, potential reversal' };
    if (index === 9) signal = { type: 'crisis', reason: 'Market volatility exceeding 3 standard deviations' };
    
    return {
      date: `${month} ${currentYear}`,
      value: randomValue,
      signal
    };
  });
};

const AISignalTimelineReplay = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSignal, setSelectedSignal] = useState(null);

  useEffect(() => {
    // Load data
    setTimeout(() => {
      setData(generateSignalData());
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Animation loop for playback
    let timer;
    if (playing && currentIndex < data.length - 1) {
      timer = setTimeout(() => {
        setCurrentIndex(prevIndex => {
          const newIndex = prevIndex + 1;
          // Check if there's a signal at this index
          if (data[newIndex]?.signal) {
            setSelectedSignal(data[newIndex].signal);
          }
          return newIndex;
        });
      }, 1000 / speed);
    } else if (playing && currentIndex >= data.length - 1) {
      setPlaying(false);
    }
    
    return () => clearTimeout(timer);
  }, [playing, currentIndex, data, speed]);

  const handlePlay = () => {
    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const handleReset = () => {
    setPlaying(false);
    setCurrentIndex(0);
    setSelectedSignal(null);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
  };

  const handleBrushChange = (range) => {
    if (range && range.startIndex !== undefined) {
      setCurrentIndex(range.startIndex);
    }
  };

  const renderSignalMarker = (signal) => {
    switch(signal.type) {
      case 'buy':
        return <div className="px-2 py-1 bg-green-500 text-white rounded-md">BUY</div>;
      case 'sell':
        return <div className="px-2 py-1 bg-red-500 text-white rounded-md">SELL</div>;
      case 'crisis':
        return <div className="px-2 py-1 bg-yellow-500 text-black rounded-md">ALERT</div>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading signal data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">AI Signal Timeline Replay</h2>
      
      {/* Playback controls */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-2">
          {!playing ? (
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={handlePlay}
            >
              Play
            </button>
          ) : (
            <button 
              className="px-4 py-2 bg-gray-500 text-white rounded-md"
              onClick={handlePause}
            >
              Pause
            </button>
          )}
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">Speed:</span>
          <select 
            value={speed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            className="px-2 py-1 border rounded-md"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">Timeline:</span>
          <span className="font-medium">
            {currentIndex < data.length ? data[currentIndex].date : 'End'}
          </span>
        </div>
      </div>
      
      {/* Signal information */}
      {selectedSignal && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold">Signal Detected:</h3>
            {renderSignalMarker(selectedSignal)}
          </div>
          <p className="text-gray-700">{selectedSignal.reason}</p>
        </div>
      )}
      
      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.slice(0, currentIndex + 1)}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <Tooltip />
            <Legend />
            
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#8884d8" 
              name="Value" 
              yAxisId="left"
              activeDot={{ r: 8 }} 
            />
            
            {/* Signal markers */}
            {data.slice(0, currentIndex + 1).map((point, index) => {
              if (point.signal) {
                const color = point.signal.type === 'buy' ? 'green' : 
                              point.signal.type === 'sell' ? 'red' : 'orange';
                              
                return (
                  <ReferenceLine 
                    key={index}
                    x={point.date} 
                    strokeDasharray="3 3" 
                    stroke={color}
                    yAxisId="left"
                  />
                );
              }
              return null;
            })}
            
            {/* Current position line */}
            <ReferenceLine 
              x={data[currentIndex]?.date} 
              stroke="blue"
              yAxisId="left"
            />
            
            <Brush 
              dataKey="date" 
              height={30} 
              stroke="#8884d8"
              onChange={handleBrushChange}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AISignalTimelineReplay;
