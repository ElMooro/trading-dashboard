import React from 'react';
import GlobalEconomicChartBuilder from './GlobalEconomicChartBuilder';
import GlobalRiskHeatmap from './GlobalRiskHeatmap';
import AISignalTimelineReplay from './AISignalTimelineReplay';
import Watchlist from './Watchlist';

const Dashboard = () => {
  return (
    <div className="container">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Macro Intelligence Terminal
      </h1>
      
      <div className="grid">
        <div className="span-full card">
          <h2 className="card-title">Global Economic Chart Builder</h2>
          <p>Chart builder component would render here</p>
        </div>
        
        <div className="card">
          <h2 className="card-title">Global Risk Heatmap</h2>
          <p>Risk heatmap would render here</p>
        </div>
        
        <div className="card">
          <h2 className="card-title">AI Signal Timeline</h2>
          <p>Timeline component would render here</p>
        </div>
      </div>
      
      <div className="card">
        <h2 className="card-title">Watchlist</h2>
        <p>Watchlist component would render here</p>
      </div>
    </div>
  );
};

export default Dashboard;
