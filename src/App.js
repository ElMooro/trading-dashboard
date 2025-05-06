import React, { useState } from 'react';
import './App.css';
import GlobalEconomicChartBuilder from './components/GlobalEconomicChartBuilder';
import GlobalRiskHeatmap from './components/GlobalRiskHeatmap';
import AISignalTimeline from './components/AISignalTimeline';
import Watchlist from './components/Watchlist';  // Changed from WatchlistComponent

function App() {
  // Shared state that connects components
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  
  // Handler for region selection that will update all components
  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    console.log(`App: Region selected: ${region}`);
  };

  // Handler for timeframe changes
  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    console.log(`App: Timeframe changed: ${timeframe}`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Global Economic Dashboard</h1>
      </header>
      <main>
        <section>
          <h2>Global Economic Chart Builder</h2>
          <GlobalEconomicChartBuilder 
            selectedRegion={selectedRegion}
            timeframe={selectedTimeframe}
          />
        </section>

        <div className="row">
          <section>
            <h2>Global Risk Heatmap</h2>
            <GlobalRiskHeatmap 
              onRegionSelect={handleRegionSelect}
              selectedRegion={selectedRegion}
            />
          </section>
          
          <section>
            <h2>AI Signal Timeline</h2>
            <AISignalTimeline 
              selectedRegion={selectedRegion}
              timeframe={selectedTimeframe}
            />
          </section>
        </div>

        <section className="watchlist-section">
          <h2>Market Watchlist</h2>
          <Watchlist 
            selectedRegion={selectedRegion}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
