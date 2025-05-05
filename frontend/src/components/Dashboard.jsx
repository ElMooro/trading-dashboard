import React from 'react';
import InteractiveTradingViewChart from './InteractiveTradingViewChart';
import GlobalEconomicChartBuilder from './GlobalEconomicChartBuilder';

const Dashboard = () => {
  return (
    <div className="dashboard-container" style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Macro Intelligence Terminal</h1>
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr', maxWidth: '1200px', margin: '0 auto' }}>
        <InteractiveTradingViewChart />
        <GlobalEconomicChartBuilder />
      </div>
    </div>
  );
};

export default Dashboard;