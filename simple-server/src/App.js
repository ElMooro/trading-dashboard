import React from 'react';
import './App.css';
import GlobalEconomicChartBuilder from './components/GlobalEconomicChartBuilder';
import GlobalRiskHeatmap from './components/GlobalRiskHeatmap';
import AISignalTimeline from './components/AISignalTimeline';
import Watchlist from './components/Watchlist';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Global Economic Dashboard</h1>
      </header>
      <main>
        <section>
          <h2>Global Economic Chart Builder</h2>
          <p>Chart builder component would render here</p>
        </section>

        <div className="row">
          <section>
            <h2>Global Risk Heatmap</h2>
            <p>Risk heatmap would render here</p>
          </section>
          
          <section>
            <h2>AI Signal Timeline</h2>
            <p>Timeline component would render here</p>
          </section>
        </div>

        <section className="watchlist-section">
          <h2>Market Watchlist</h2>
          <Watchlist />
        </section>
      </main>
    </div>
  );
}

export default App;
