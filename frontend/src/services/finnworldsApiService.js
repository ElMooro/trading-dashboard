import axios from 'axios';

// API key stored in environment variables
const FINNWORLDS_API_KEY = process.env.REACT_APP_FINNWORLDS_API_KEY || 'YOUR_FINNWORLDS_API_KEY_HERE';
const FINNWORLDS_API_BASE_URL = 'https://api.finnworlds.com/stock';

// Function to fetch market data
export const fetchMarketData = async (symbol, interval = 'daily', limit = 100) => {
  try {
    const response = await axios.get(`${FINNWORLDS_API_BASE_URL}/candle`, {
      params: {
        apikey: FINNWORLDS_API_KEY,
        symbol,
        interval,
        limit
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching market data for ${symbol}:`, error);
    throw error;
  }
};

// Function to fetch multiple symbols
export const fetchMultipleSymbols = async (symbols, interval = 'daily', limit = 100) => {
  try {
    const promises = symbols.map(symbol => fetchMarketData(symbol, interval, limit));
    const results = await Promise.all(promises);
    
    // Format the data for your chart
    const formattedData = {};
    symbols.forEach((symbol, index) => {
      formattedData[symbol] = results[index];
    });
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching multiple symbols:', error);
    throw error;
  }
};

// Function to fetch market news
export const fetchMarketNews = async (category = 'general') => {
  try {
    const response = await axios.get(`${FINNWORLDS_API_BASE_URL}/news`, {
      params: {
        apikey: FINNWORLDS_API_KEY,
        category,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching market news:', error);
    throw error;
  }
};