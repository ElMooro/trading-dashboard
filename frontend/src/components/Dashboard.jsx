import React from 'react';
import InteractiveTradingViewChart from './InteractiveTradingViewChart';
import GlobalEconomicChartBuilder from './GlobalEconomicChartBuilder';
import GlobalRiskHeatmap from './GlobalRiskHeatmap';

const Dashboard = () => {
  return (
    <div className="dashboard-container" style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Macro Intelligence Terminal</h1>
      
      <div style={{ 
        display: 'grid', 
        gap: '20px', 
        gridTemplateColumns: '1fr', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {/* First row - Trading View Chart */}
        <InteractiveTradingViewChart />
        
        {/* Second row - Economic Chart Builder */}
        <GlobalEconomicChartBuilder />
        
        {/* Third row - Risk Heatmap */}
        <GlobalRiskHeatmap />
      </div>
    </div>
  );
};

export default Dashboard;