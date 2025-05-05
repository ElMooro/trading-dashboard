// src/services/nyFedApiService.js
import axios from 'axios';

const NY_FED_BASE_URL = 'https://www.newyorkfed.org/api';

/**
 * Fetch time series data from NY Fed API
 * @param {string} seriesId - NY Fed series ID
 * @param {object} options - Additional options
 */
export const fetchNyFedData = async (seriesId, options = {}) => {
  try {
    // NY Fed typically organizes data by category and dataset
    const [category, dataset] = seriesId.split('.');
    
    const response = await axios.get(`${NY_FED_BASE_URL}/${category}/${dataset}`, {
      params: {
        series: seriesId,
        ...options
      }
    });

    // Transform the data to the expected format
    // Note: This will need adjustment based on actual NY Fed API structure
    const observations = response.data.observations.map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value) || null
    }));

    return { observations };
  } catch (error) {
    console.error("Error fetching NY Fed data:", error);
    throw error;
  }
};

/**
 * Fetch series information from NY Fed
 * @param {string} seriesId - NY Fed series ID
 */
export const fetchNyFedSeriesInfo = async (seriesId) => {
  try {
    const [category, dataset] = seriesId.split('.');
    
    const response = await axios.get(`${NY_FED_BASE_URL}/${category}/${dataset}/metadata`, {
      params: {
        series: seriesId
      }
    });

    const metadata = response.data;
    
    return {
      title: metadata.title || seriesId,
      description: metadata.description || '',
      frequency: metadata.frequency || '',
      units: metadata.units || '',
      source: 'NY Fed',
      lastUpdated: metadata.last_updated || new Date().toISOString(),
      category: metadata.category || ''
    };
  } catch (error) {
    console.error("Error fetching NY Fed series info:", error);
    throw error;
  }
};

/**
 * Fetch Federal Funds Rate data
 */
export const fetchFedFundsRate = async () => {
  try {
    // This is a placeholder - adjust to actual NY Fed API structure
    return await fetchNyFedData('monetary.fedfunds');
  } catch (error) {
    console.error("Error fetching Fed Funds Rate:", error);
    throw error;
  }
};

/**
 * Fetch Treasury Yield Curve data
 */
export const fetchTreasuryYieldCurve = async () => {
  try {
    // This is a placeholder - adjust to actual NY Fed API structure
    return await fetchNyFedData('markets.treasury');
  } catch (error) {
    console.error("Error fetching Treasury Yield Curve:", error);
    throw error;
  }
};