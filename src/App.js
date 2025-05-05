import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import InteractiveTradingViewChart from './components/InteractiveTradingViewChart';
import GlobalEconomicChartBuilder from './components/GlobalEconomicChartBuilder';
import GlobalRiskHeatmap from './components/GlobalRiskHeatmap';
import Watchlist from './components/Watchlist';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <WatchlistProvider>
        {/* Toast notifications container */}
        <ToastContainer position="top-right" autoClose={3000} />
        
        {/* Define your routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chart/:seriesId" element={<InteractiveTradingViewChart />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/heatmap" element={<GlobalRiskHeatmap />} />
          <Route path="/economic-chart" element={<GlobalEconomicChartBuilder />} />
          {/* Add other routes as needed */}
        </Routes>
      </WatchlistProvider>
    </BrowserRouter>
  );
}

export default App;