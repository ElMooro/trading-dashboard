import React from 'react';
import './App.css';

// Import components
import GlobalEconomicChartBuilder from './components/GlobalEconomicChartBuilder';
import GlobalRiskHeatmap from './components/GlobalRiskHeatmap';
import AISignalTimeline from './components/InteractiveTradingViewChart';
import WatchlistComponent from './contexts/WatchlistContext';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>Macro Intelligence Terminal</h1>
      </header>
      <main>
        <div className="container">
          <section>
            <h2>Global Economic Chart Builder</h2>
            <GlobalEconomicChartBuilder />
          </section>
        </div>

        <div className="row">
          <section>
            <h2>Global Risk Heatmap</h2>
            <GlobalRiskHeatmap />
          </section>

          <section>
            <h2>AI Signal Timeline</h2>
            <AISignalTimeline />
          </section>
        </div>

        <div className="container">
          <section>
            <h2>Watchlist</h2>
            <WatchlistComponent />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
