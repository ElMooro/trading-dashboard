import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import InteractiveTradingViewChart from './InteractiveTradingViewChart';
import GlobalEconomicChartBuilder from './GlobalEconomicChartBuilder';
import GlobalRiskHeatmap from './GlobalRiskHeatmap';
import { WatchlistContext } from '../contexts/WatchlistContext';

const Dashboard = () => {
  const { watchlist, addToWatchlist } = useContext(WatchlistContext);
  const [trendingIndicators, setTrendingIndicators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data from APIs
    const fetchData = async () => {
      // Mock data - replace with actual API calls later
      setTrendingIndicators([
        { id: 'gdp', name: 'US GDP', value: '23.32T', change: 2.1, category: 'Economic' },
        { id: 'inf', name: 'US Inflation', value: '3.2%', change: -0.4, category: 'Economic' },
        { id: 'unemp', name: 'Unemployment', value: '3.8%', change: 0.1, category: 'Labor' },
        { id: 'ism', name: 'ISM Manufacturing', value: '48.2', change: -1.3, category: 'Industry' }
      ]);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const handleAddToWatchlist = (indicator) => {
    addToWatchlist({
      seriesId: indicator.id,
      name: indicator.name,
      value: indicator.value,
      change: indicator.change
    });
  };

  return (
    <div className="dashboard-container p-5">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Macro Intelligence Terminal</h1>
          <nav className="flex space-x-4">
            <Link to="/" className="text-blue-600 hover:underline">Dashboard</Link>
            <Link to="/economic-chart" className="text-blue-600 hover:underline">Chart Builder</Link>
            <Link to="/heatmap" className="text-blue-600 hover:underline">Risk Heatmap</Link>
            <Link to="/watchlist" className="text-blue-600 hover:underline">
              Watchlist {watchlist.length > 0 && <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">{watchlist.length}</span>}
            </Link>
          </nav>
        </div>
      </header>

      {/* Key Indicators Section */}
      <section className="mb-8 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Key Economic Indicators</h2>
        {loading ? (
          <p>Loading indicators...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {trendingIndicators.map((indicator) => (
              <div key={indicator.id} className="border rounded-lg p-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{indicator.category}</span>
                  <button 
                    onClick={() => handleAddToWatchlist(indicator)}
                    disabled={watchlist.some(item => item.seriesId === indicator.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {watchlist.some(item => item.seriesId === indicator.id) ? '★' : '+ Watch'}
                  </button>
                </div>
                <h3 className="font-medium mt-1">{indicator.name}</h3>
                <div className="flex items-end mt-2">
                  <span className="text-lg font-bold">{indicator.value}</span>
                  <span className={`ml-2 text-sm ${indicator.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {indicator.change > 0 ? '+' : ''}{indicator.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <div className="grid gap-8 max-w-7xl mx-auto">
        {/* First row - Trading View Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Interactive Trading View</h2>
            <Link to="/chart/default" className="text-sm text-blue-600 hover:underline">Full Screen</Link>
          </div>
          <InteractiveTradingViewChart />
        </div>
        
        {/* Second row - Economic Chart Builder */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Economic Chart Builder</h2>
            <Link to="/economic-chart" className="text-sm text-blue-600 hover:underline">Customize</Link>
          </div>
          <GlobalEconomicChartBuilder />
        </div>
        
        {/* Third row - Risk Heatmap */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Global Risk Heatmap</h2>
            <Link to="/heatmap" className="text-sm text-blue-600 hover:underline">View Details</Link>
          </div>
          <GlobalRiskHeatmap />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;