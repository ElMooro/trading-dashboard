import React, { useState, useEffect, useRef } from 'react';
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
  ReferenceLine,
  ReferenceArea
} from 'recharts';

// Mock data - in production, this would come from your API
const generateTimelineData = () => {
  const data = [];
  const startDate = new Date('2024-01-01');
  const signals = [
    { date: '2024-01-15', type: 'Buy', confidence: 0.85, explanation: 'Positive momentum crossover detected with strong volume confirmation' },
    { date: '2024-02-10', type: 'Risk', confidence: 0.73, explanation: 'Market sentiment deterioration coupled with policy uncertainty' },
    { date: '2024-03-05', type: 'Sell', confidence: 0.91, explanation: 'Technical breakdown below key support with bearish momentum divergence' },
    { date: '2024-04-20', type: 'Buy', confidence: 0.82, explanation: 'Oversold conditions with positive divergence and macro tailwinds' },
    { date: '2024-05-15', type: 'Crisis', confidence: 0.95, explanation: 'Liquidity crisis indicators triggered with systemic risk spreading' },
  ];

  for (let i = 0; i < 150; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // Generate a value with some randomness + trend
    let value = 100 + Math.sin(i / 20) * 25 + Math.random() * 5;
    
    // Add mini-trends
    if (i > 50 && i < 80) value += 15;
    if (i > 100 && i < 130) value -= 20;
    
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Find if there's a signal on this date
    const signal = signals.find(s => s.date === dateStr);
    
    data.push({
      date: dateStr,
      value: parseFloat(value.toFixed(2)),
      volume: Math.floor(Math.random() * 1000) + 500,
      signal: signal ? signal.type : undefined,
      signalConfidence: signal ? signal.confidence : undefined,
      signalExplanation: signal ? signal.explanation : undefined
    });
  }
  
  return { data, signals };
};

const { data: timelineData, signals } = generateTimelineData();

// Get signal colors
const getSignalColor = (type) => {
  switch (type) {
    case 'Buy': return '#4CAF50';
    case 'Sell': return '#F44336';
    case 'Risk': return '#FF9800';
    case 'Crisis': return '#9C27B0';
    default: return '#2196F3';
  }
};

const AISignalTimeline = () => {
  const [playbackState, setPlaybackState] = useState('paused');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewData, setViewData] = useState(timelineData.slice(0, 30)); // Initial view
  const [selectedSignal, setSelectedSignal] = useState(null);
  const playbackRef = useRef(null);

  // Handle playback
  useEffect(() => {
    if (playbackState === 'playing') {
      playbackRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const newIndex = prevIndex + 1;
          if (newIndex >= timelineData.length) {
            setPlaybackState('paused');
            return prevIndex;
          }
          // Update view data based on new index
          const start = Math.max(0, newIndex - 29);
          setViewData(timelineData.slice(0, newIndex + 1));
          return newIndex;
        });
      }, 500 / playbackSpeed);
    } else {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    }

    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    };
  }, [playbackState, playbackSpeed]);

  // Toggle playback
  const togglePlayback = () => {
    setPlaybackState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  // Change playback speed
  const changeSpeed = (speed) => {
    setPlaybackSpeed(speed);
  };

  // Reset playback
  const resetPlayback = () => {
    setPlaybackState('paused');
    setCurrentIndex(0);
    setViewData(timelineData.slice(0, 30));
    setSelectedSignal(null);
  };

  // Click on a signal
  const handleSignalClick = (signal) => {
    setSelectedSignal(signal);
  };

  // Custom tooltip to show signal information
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="custom-tooltip">
          <p className="date">{`Date: ${data.date}`}</p>
          <p className="value">{`Value: ${data.value}`}</p>
          <p className="volume">{`Volume: ${data.volume}`}</p>
          {data.signal && (
            <div className="signal-info">
              <p className="signal-type" style={{ color: getSignalColor(data.signal) }}>
                {`Signal: ${data.signal}`}
              </p>
              <p className="signal-confidence">{`Confidence: ${Math.round(data.signalConfidence * 100)}%`}</p>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="ai-signal-timeline">
      <div className="chart-container" style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={viewData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload[0].payload.signal) {
                handleSignalClick(data.activePayload[0].payload);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#2196F3" 
              dot={false}
              activeDot={{ 
                r: (data) => data.signal ? 8 : 4,
                stroke: (data) => data.signal ? getSignalColor(data.signal) : '#2196F3',
                strokeWidth: (data) => data.signal ? 2 : 1,
              }} 
            />
            
            {/* Signal reference lines */}
            {viewData
              .filter(item => item.signal)
              .map((item, index) => (
                <ReferenceLine 
                  key={`signal-${index}`}
                  x={item.date} 
                  stroke={getSignalColor(item.signal)}
                  strokeDasharray="3 3"
                  strokeWidth={2}
                />
              ))}
              
            {/* Current position line */}
            {currentIndex > 0 && (
              <ReferenceLine
                x={viewData[viewData.length - 1].date}
                stroke="#000"
                strokeWidth={2}
              />
            )}
            
            <Brush dataKey="date" height={30} stroke="#2196F3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="timeline-controls">
        <div className="playback-controls">
          <button onClick={resetPlayback}>
            <span role="img" aria-label="Reset">⏮</span>
          </button>
          <button onClick={togglePlayback}>
            {playbackState === 'playing' ? (
              <span role="img" aria-label="Pause">⏸</span>
            ) : (
              <span role="img" aria-label="Play">▶️</span>
            )}
          </button>
          <div className="speed-controls">
            <span>Speed:</span>
            {[0.5, 1, 2, 5].map(speed => (
              <button 
                key={`speed-${speed}`}
                onClick={() => changeSpeed(speed)}
                className={playbackSpeed === speed ? 'active' : ''}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
        
        <div className="progress-info">
          <span>Date: {viewData[viewData.length - 1]?.date}</span>
          <span>Progress: {Math.round((currentIndex / timelineData.length) * 100)}%</span>
        </div>
      </div>
      
      {selectedSignal && (
        <div className="signal-details">
          <h3>{selectedSignal.signal} Signal Detected on {selectedSignal.date}</h3>
          <div className="signal-metrics">
            <div className="metric">
              <span>Confidence</span>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill" 
                  style={{ 
                    width: `${selectedSignal.signalConfidence * 100}%`,
                    backgroundColor: getSignalColor(selectedSignal.signal)
                  }}
                ></div>
              </div>
              <span>{Math.round(selectedSignal.signalConfidence * 100)}%</span>
            </div>
          </div>
          <div className="signal-explanation">
            <h4>AI Explanation</h4>
            <p>{selectedSignal.signalExplanation}</p>
          </div>
          <button onClick={() => setSelectedSignal(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AISignalTimeline;
