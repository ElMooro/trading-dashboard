import axios from 'axios';

// ECB Statistical Data Warehouse API
const ECB_API_BASE_URL = 'https://sdw-wsrest.ecb.europa.eu/service/';

// Function to fetch ECB data
export const fetchEcbData = async (flowRef, key, startPeriod, endPeriod) => {
  try {
    const response = await axios.get(`${ECB_API_BASE_URL}data/${flowRef}/${key}`, {
      params: {
        startPeriod,
        endPeriod,
        format: 'jsondata'
      },
      headers: {
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching ECB data for ${flowRef}/${key}:`, error);
    throw error;
  }
};

// Function to fetch Euro Area GDP
export const fetchEuroAreaGdp = async () => {
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(currentDate.getFullYear() - 5);
  
  const startPeriod = startDate.toISOString().split('T')[0];
  const endPeriod = currentDate.toISOString().split('T')[0];
  
  try {
    // MNA.Q.Y.I8.W2.S1.S1.B.B1GQ._Z._Z._Z.EUR.LR.N - Euro Area GDP growth rate
    const gdpData = await fetchEcbData('MNA', 'Q.Y.I8.W2.S1.S1.B.B1GQ._Z._Z._Z.EUR.LR.N', startPeriod, endPeriod);
    return gdpData;
  } catch (error) {
    console.error('Error fetching Euro Area GDP:', error);
    throw error;
  }
};

// Function to fetch Euro Area Inflation
export const fetchEuroAreaInflation = async () => {
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(currentDate.getFullYear() - 5);
  
  const startPeriod = startDate.toISOString().split('T')[0];
  const endPeriod = currentDate.toISOString().split('T')[0];
  
  try {
    // ICP.M.U2.N.000000.4.ANR - Euro Area HICP
    const inflationData = await fetchEcbData('ICP', 'M.U2.N.000000.4.ANR', startPeriod, endPeriod);
    return inflationData;
  } catch (error) {
    console.error('Error fetching Euro Area Inflation:', error);
    throw error;
  }
};