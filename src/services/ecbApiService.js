// src/services/ecbApiService.js
import axios from 'axios';

const ECB_BASE_URL = 'https://sdw-wsrest.ecb.europa.eu/service';

/**
 * Fetch time series data from ECB Statistical Data Warehouse
 * @param {string} seriesId - ECB series ID
 * @param {object} options - Additional options
 */
export const fetchEcbData = async (seriesId, options = {}) => {
  try {
    // ECB uses a specific structure for series IDs
    const [flowRef, key] = seriesId.split('.');
    
    const response = await axios.get(`${ECB_BASE_URL}/data/${flowRef}/${key}`, {
      params: {
        format: 'jsondata',
        ...options
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    // Transform the data to the format expected by the chart component
    const series = response.data.dataSets[0].series['0:0:0:0:0'];
    const observations = series.observations || [];
    const dates = response.data.structure.dimensions.observation[0].values;

    const transformedData = observations.map((obs, index) => ({
      date: dates[index].name,
      value: parseFloat(obs[0]) || null
    }));

    return { observations: transformedData };
  } catch (error) {
    console.error("Error fetching ECB data:", error);
    throw error;
  }
};

/**
 * Fetch series information from ECB
 * @param {string} seriesId - ECB series ID
 */
export const fetchEcbSeriesInfo = async (seriesId) => {
  try {
    const [flowRef, key] = seriesId.split('.');
    
    const response = await axios.get(`${ECB_BASE_URL}/data/${flowRef}/${key}`, {
      params: {
        format: 'jsondata',
        detail: 'full'
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    const dataStructure = response.data.structure;
    const dimensions = dataStructure.dimensions.series;
    
    // Extract title and other metadata
    const title = dimensions.map(dim => 
      dim.values[0]?.name || ''
    ).filter(Boolean).join(' - ');
    
    return {
      title,
      description: response.data.description || '',
      frequency: dimensions.find(d => d.id === 'FREQ')?.values[0]?.name || '',
      units: dimensions.find(d => d.id === 'UNIT')?.values[0]?.name || '',
      source: 'ECB',
      lastUpdated: new Date().toISOString(),
      category: dimensions.find(d => d.id === 'DATA_DOMAIN')?.values[0]?.name || ''
    };
  } catch (error) {
    console.error("Error fetching ECB series info:", error);
    throw error;
  }
};

// Function to fetch Euro Area Inflation
export const fetchEuroAreaInflation = async () => {
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(currentDate.getFullYear() - 5);
  
  const startPeriod = startDate.toISOString().split('T');
  const endPeriod = currentDate.toISOString().split('T');
  
  try {
    // ICP.M.U2.N.000000.4.ANR - Euro Area HICP
    const inflationData = await fetchEcbData("ICP", "M.U");
    return inflationData;
  } catch (error) {
    console.error("Error fetching Euro Area Inflation:", error);
    throw error;
  }
};