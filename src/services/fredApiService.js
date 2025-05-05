import axios from 'axios';

// We'll store the API key in an environment variable later
const FRED_API_KEY = process.env.REACT_APP_FRED_API_KEY || 'YOUR_FRED_API_KEY_HERE';
const FRED_API_BASE_URL = 'https://api.stlouisfed.org/fred/';

// Map your chart indicators to FRED series IDs
const INDICATOR_SERIES_MAP = {
  gdp: 'GDP',                 // Real GDP
  inflation: 'CPIAUCSL',      // Consumer Price Index
  unemployment: 'UNRATE',     // Unemployment Rate
  interest: 'FEDFUNDS',       // Federal Funds Rate
  debt: 'GFDEGDQ188S',        // Federal Debt to GDP
  balance: 'NETFI',           // U.S. Net International Investment Position
};

// Fetch a single time series from FRED
export const fetchFredTimeSeries = async (seriesId, params = {}) => {
  try {
    const response = await axios.get(`${FRED_API_BASE_URL}series/observations`, {
      params: {
        series_id: seriesId,
        api_key: FRED_API_KEY,
        file_type: 'json',
        ...params,
      },
    });
    
    return response.data.observations;
  } catch (error) {
    console.error(`Error fetching FRED data for series ${seriesId}:`, error);
    throw error;
  }
};

// Function to fetch multiple indicators and format for your chart
export const fetchEconomicIndicators = async (indicators, timeframe) => {
  // Calculate start date based on timeframe
  const endDate = new Date().toISOString().split('T')[0];
  let startDate;
  
  switch (timeframe) {
    case '6m':
      startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '1y':
      startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '3y':
      startDate = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '5y':
      startDate = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case 'max':
    default:
      startDate = '2000-01-01'; // Reasonable default for economic data
  }
  
  try {
    // Fetch data for each requested indicator
    const promises = indicators.map(indicator => {
      const seriesId = INDICATOR_SERIES_MAP[indicator];
      if (!seriesId) {
        console.warn(`No FRED series ID mapped for indicator: ${indicator}`);
        return Promise.resolve([]);
      }
      
      return fetchFredTimeSeries(seriesId, {
        observation_start: startDate,
        observation_end: endDate,
        frequency: 'm', // Monthly data
      });
    });
    
    const results = await Promise.all(promises);
    
    // Process and merge the data for your chart
    const mergedData = {};
    
    indicators.forEach((indicator, index) => {
      const data = results[index];
      if (!data || data.length === 0) return;
      
      data.forEach(observation => {
        if (!mergedData[observation.date]) {
          mergedData[observation.date] = { date: observation.date };
        }
        mergedData[observation.date][indicator] = parseFloat(observation.value);
      });
    });
    
    // Convert to array and sort by date
    return Object.values(mergedData).sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Error fetching economic indicators:', error);
    throw error;
  }
};