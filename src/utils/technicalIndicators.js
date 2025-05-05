// src/utils/technicalIndicators.js

/**
 * Calculate Simple Moving Average (SMA)
 * @param {Array} data - Array of price data points with time and value properties
 * @param {number} period - Period for SMA calculation
 * @returns {Array} - SMA data points
 */
export const sma = (data, period = 20) => {
    if (!data || data.length < period) return [];
    
    const result = [];
    
    // Sort data by time in ascending order (oldest first)
    const sortedData = [...data].sort((a, b) => a.time - b.time);
    
    for (let i = period - 1; i < sortedData.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        if (sortedData[i - j].value !== null) {
          sum += sortedData[i - j].value;
        }
      }
      
      result.push({
        time: sortedData[i].time,
        value: sum / period
      });
    }
    
    return result;
  };
  
  /**
   * Calculate Exponential Moving Average (EMA)
   * @param {Array} data - Array of price data points with time and value properties
   * @param {number} period - Period for EMA calculation
   * @returns {Array} - EMA data points
   */
  export const ema = (data, period = 20) => {
    if (!data || data.length < period) return [];
    
    const result = [];
    
    // Sort data by time in ascending order (oldest first)
    const sortedData = [...data].sort((a, b) => a.time - b.time);
    
    // Calculate multiplier
    const multiplier = 2 / (period + 1);
    
    // Calculate first SMA as starting point
    let sum = 0;
    for (let i = 0; i < period; i++) {
      if (sortedData[i].value !== null) {
        sum += sortedData[i].value;
      }
    }
    let prevEma = sum / period;
    
    result.push({
      time: sortedData[period - 1].time,
      value: prevEma
    });
    
    // Calculate EMA for remaining data points
    for (let i = period; i < sortedData.length; i++) {
      if (sortedData[i].value !== null) {
        const currentEma = (sortedData[i].value - prevEma) * multiplier + prevEma;
        result.push({
          time: sortedData[i].time,
          value: currentEma
        });
        prevEma = currentEma;
      } else {
        result.push({
          time: sortedData[i].time,
          value: prevEma
        });
      }
    }
    
    return result;
  };
  
  /**
   * Calculate Relative Strength Index (RSI)
   * @param {Array} data - Array of price data points with time and value properties
   * @param {number} period - Period for RSI calculation (typically 14)
   * @returns {Array} - RSI data points
   */
  export const rsi = (data, period = 14) => {
    if (!data || data.length <= period) return [];
    
    const result = [];
    
    // Sort data by time in ascending order (oldest first)
    const sortedData = [...data].sort((a, b) => a.time - b.time);
    
    // Calculate price changes
    const changes = [];
    for (let i = 1; i < sortedData.length; i++) {
      if (sortedData[i].value !== null && sortedData[i-1].value !== null) {
        changes.push(sortedData[i].value - sortedData[i-1].value);
      } else {
        changes.push(0);
      }
    }
    
    // Calculate initial averages
    let gainSum = 0;
    let lossSum = 0;
    
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) {
        gainSum += changes[i];
      } else {
        lossSum += Math.abs(changes[i]);
      }
    }
    
    let avgGain = gainSum / period;
    let avgLoss = lossSum / period;
    
    // Calculate first RSI
    let rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
    let rsiValue = 100 - (100 / (1 + rs));
    
    result.push({
      time: sortedData[period].time,
      value: rsiValue
    });
    
    // Calculate RSI for remaining data points
    for (let i = period; i < changes.length; i++) {
      // Smooth averages using Wilder's approach
      avgGain = ((avgGain * (period - 1)) + (changes[i] > 0 ? changes[i] : 0)) / period;
      avgLoss = ((avgLoss * (period - 1)) + (changes[i] < 0 ? Math.abs(changes[i]) : 0)) / period;
      
      rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss);
      rsiValue = 100 - (100 / (1 + rs));
      
      result.push({
        time: sortedData[i+1].time,
        value: rsiValue
      });
    }
    
    return result;
  };
  
  /**
   * Calculate Moving Average Convergence Divergence (MACD)
   * @param {Array} data - Array of price data points with time and value properties
   * @param {number} fastPeriod - Fast EMA period (typically 12)
   * @param {number} slowPeriod - Slow EMA period (typically 26)
   * @param {number} signalPeriod - Signal EMA period (typically 9)
   * @returns {Object} - Object containing MACD line, signal line, and histogram data
   */
  export const macd = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
    if (!data || data.length < Math.max(fastPeriod, slowPeriod) + signalPeriod) return { macdLine: [], signalLine: [], histogram: [] };
    
    // Calculate fast and slow EMAs
    const fastEma = ema(data, fastPeriod);
    const slowEma = ema(data, slowPeriod);
    
    // Align the data by time
    const timeMap = new Map();
    fastEma.forEach(point => {
      timeMap.set(point.time, { fast: point.value });
    });
    
    slowEma.forEach(point => {
      if (timeMap.has(point.time)) {
        timeMap.get(point.time).slow = point.value;
      }
    });
    
    // Calculate MACD line
    const macdLine = [];
    timeMap.forEach((value, time) => {
      if (value.fast !== undefined && value.slow !== undefined) {
        macdLine.push({
          time,
          value: value.fast - value.slow
        });
      }
    });
    
    // Calculate signal line (9-period EMA of MACD line)
    const signalLine = ema(macdLine, signalPeriod);
    
    // Calculate histogram (MACD line - signal line)
    const histogram = [];
    const signalMap = new Map();
    signalLine.forEach(point => {
      signalMap.set(point.time, point.value);
    });
    
    macdLine.forEach(point => {
      if (signalMap.has(point.time)) {
        const histValue = point.value - signalMap.get(point.time);
        histogram.push({
          time: point.time,
          value: histValue,
          color: histValue >= 0 ? 'rgba(76, 175, 80, 0.5)' : 'rgba(255, 82, 82, 0.5)'
        });
      }
    });
    
    return { macdLine, signalLine, histogram };
  };
  
  /**
   * Calculate Bollinger Bands
   * @param {Array} data - Array of price data points with time and value properties
   * @param {number} period - Period for MA calculation (typically 20)
   * @param {number} stdDev - Standard deviation multiplier (typically 2)
   * @returns {Object} - Object containing upper, middle, and lower bands
   */
  export const bollingerBands = (data, period = 20, stdDev = 2) => {
    if (!data || data.length < period) return { upper: [], middle: [], lower: [] };
    
    // Calculate SMA (middle band)
    const middle = sma(data, period);
    
    // Calculate upper and lower bands
    const upper = [];
    const lower = [];
    
    // Sort data by time in ascending order (oldest first)
    const sortedData = [...data].sort((a, b) => a.time - b.time);
    
    // Map SMA values by time for easier lookup
    const smaMap = new Map();
    middle.forEach(point => {
      smaMap.set(point.time, point.value);
    });
    
    // Calculate standard deviation and bands
    for (let i = period - 1; i < sortedData.length; i++) {
      const currentTime = sortedData[i].time;
      if (!smaMap.has(currentTime)) continue;
      
      const smaValue = smaMap.get(currentTime);
      
      // Calculate standard deviation
      let sumSquaredDiff = 0;
      for (let j = 0; j < period; j++) {
        if (sortedData[i - j].value !== null) {
          sumSquaredDiff += Math.pow(sortedData[i - j].value - smaValue, 2);
        }
      }
      const standardDeviation = Math.sqrt(sumSquaredDiff / period);
      
      // Calculate bands
      upper.push({
        time: currentTime,
        value: smaValue + (standardDeviation * stdDev)
      });
      
      lower.push({
        time: currentTime,
        value: smaValue - (standardDeviation * stdDev)
      });
    }
    
    return { upper, middle, lower };
  };
  
  // Placeholder implementations for other indicators
  export const atr = (data, period = 14) => {
    // Implementation for Average True Range
    return [];
  };
  
  export const ichimokuCloud = (data, conversionPeriod = 9, basePeriod = 26, laggingSpanPeriod = 52, displacement = 26) => {
    // Implementation for Ichimoku Cloud
    return { conversionLine: [], baseLine: [], leadingSpanA: [], leadingSpanB: [], laggingSpan: [] };
  };
  
  export const stochasticOscillator = (data, kPeriod = 14, dPeriod = 3, smooth = 3) => {
    // Implementation for Stochastic Oscillator
    return { k: [], d: [] };
  };
  
  export const obv = (data) => {
    // Implementation for On-Balance Volume
    return [];
  };
  
  export const fibonacciRetracement = (data, highPoint, lowPoint) => {
    // Implementation for Fibonacci Retracement
    return { levels: [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1] };
  };
  
  export const pivotPoints = (data, method = 'standard') => {
    // Implementation for Pivot Points
    return { pivot: 0, r1: 0, r2: 0, r3: 0, s1: 0, s2: 0, s3: 0 };
  };