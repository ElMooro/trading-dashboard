import axios from 'axios';

// NY Fed API endpoints
const NY_FED_API_BASE_URL = 'https://markets.newyorkfed.org/api/';

// Function to fetch NY Fed market data
export const fetchNyFedData = async (market, dataType) => {
  try {
    const response = await axios.get(`${NY_FED_API_BASE_URL}${market}/${dataType}.json`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching NY Fed data for ${market}/${dataType}:`, error);
    throw error;
  }
};

// Function to fetch rates data
export const fetchRatesData = async () => {
  try {
    // Fetch the fed funds rate
    const fedFundsData = await fetchNyFedData('rates', 'fed-funds');
    
    // Fetch treasury rates
    const treasuryData = await fetchNyFedData('rates', 'treasury');
    
    // Format the data for your chart
    return {
      fedFunds: fedFundsData,
      treasury: treasuryData
    };
  } catch (error) {
    console.error('Error fetching rates data:', error);
    throw error;
  }
};

// Function to fetch SOFR data
export const fetchSofrData = async () => {
  try {
    const sofrData = await fetchNyFedData('rates', 'sofr');
    return sofrData;
  } catch (error) {
    console.error('Error fetching SOFR data:', error);
    throw error;
  }
};