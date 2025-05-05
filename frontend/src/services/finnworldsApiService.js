// src/services/finnworldsApiService.js
import axios from 'axios';

// Set your Finnworlds API key - store in environment variables
const FINNWORLDS_API_KEY = process.env.REACT_APP_FINNWORLDS_API_KEY;
const FINNWORLDS_BASE_URL = 'https://api.finnworlds.com/v1';

/**
 * Fetch time series data from Finnworlds API
 * @param {string} seriesId - Finnworlds series ID
 * @param {object} options - Additional options
 */
export const fetchFinnworldsData = async (seriesId, options = {}) => {
  try {
    const response = await axios.get(`${FINNWORLDS_BASE_URL}/timeseries/${seriesId}`, {
      params: {
        api_key: FINNWORLDS_API_KEY,
        ...options
      }
    });

    // Transform the data to the expected format
    const observations = response.data.data.map(item => ({
      date: item.date,
      value: parseFloat(item.value) || null
    }));

    return { observations };
  } catch (error) {
    console.error("Error fetching Finnworlds data:", error);
    throw error;
  }
};

/**
 * Fetch series information from Finnworlds
 * @param {string} seriesId - Finnworlds series ID
 */
export const fetchFinnworldsSeriesInfo = async (seriesId) => {
  try {
    const response = await axios.get(`${FINNWORLDS_BASE_URL}/timeseries/${seriesId}/metadata`, {
      params: {
        api_key: FINNWORLDS_API_KEY
      }
    });

    const metadata = response.data;
    
    return {
      title: metadata.name || seriesId,
      description: metadata.description || '',
      frequency: metadata.frequency || '',
      units: metadata.unit || '',
      source: 'Finnworlds',
      lastUpdated: metadata.last_updated || new Date().toISOString(),
      category: metadata.category || ''
    };
  } catch (error) {
    console.error("Error fetching Finnworlds series info:", error);
    throw error;
  }
};

/**
 * Search for series in Finnworlds
 * @param {string} query - Search query
 */
export const searchFinnworldsSeries = async (query) => {
  try {
    const response = await axios.get(`${FINNWORLDS_BASE_URL}/timeseries/search`, {
      params: {
        api_key: FINNWORLDS_API_KEY,
        q: query
      }
    });
    
    return response.data.results || [];
  } catch (error) {
    console.error("Error searching Finnworlds series:", error);
    throw error;
  }
};