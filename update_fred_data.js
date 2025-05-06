const fs = require('fs');
const path = require('path');
const https = require('https');

// Replace with your actual API key
const FRED_API_KEY = process.env.FRED_API_KEY || 'your_api_key';

async function fetchFREDData(seriesId, startDate, endDate, frequency = 'm') {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      series_id: seriesId,
      api_key: FRED_API_KEY,
      file_type: 'json',
      observation_start: startDate,
      observation_end: endDate,
      frequency: frequency
    });
    
    const url = `https://api.stlouisfed.org/fred/series/observations?${params}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function updateFREDSeries(seriesId, startDate, endDate) {
  try {
    console.log(`Fetching data for ${seriesId}...`);
    const data = await fetchFREDData(seriesId, startDate, endDate);
    
    // Create directory if it doesn't exist
    const dirPath = path.join('_data', 'api', 'fred');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Write to file
    const filePath = path.join(dirPath, `${seriesId.toLowerCase()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`Data saved to ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${seriesId}:`, error);
  }
}

// Example usage:
// Update GDP data from 2019 to now
const seriesId = process.argv[2] || 'GDP';
const startDate = process.argv[3] || '2019-01-01';
const endDate = process.argv[4] || new Date().toISOString().split('T')[0];

updateFREDSeries(seriesId, startDate, endDate)
  .then(() => console.log('Update complete'))
  .catch(error => console.error('Update failed:', error));
