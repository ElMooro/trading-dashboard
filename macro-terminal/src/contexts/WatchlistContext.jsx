import React, { useState, createContext, useContext } from 'react';

// Create a context for watchlist state management
const WatchlistContext = createContext();

// Mock data - in production this would come from your API
const mockWatchlistData = [
  { id: 'GDP_US', name: 'US GDP', value: '24.01T', change: 2.5, aiScore: 78, volatility: 0.15, status: 'normal' },
  { id: 'INFL_US', name: 'US Inflation', value: '3.7%', change: 0.2, aiScore: 65, volatility: 0.45, status: 'caution' },
  { id: 'UNEMP_US', name: 'US Unemployment', value: '3.6%', change: -0.1, aiScore: 85, volatility: 0.10, status: 'normal' },
  { id: 'FFRATE', name: 'Fed Funds Rate', value: '5.5%', change: 0, aiScore: 55, volatility: 0.20, status: 'caution' },
  { id: 'PMI_US', name: 'US PMI', value: '51.2', change: -0.8, aiScore: 62, volatility: 0.35, status: 'caution' },
  { id: 'RETAIL_US', name: 'US Retail Sales', value: '+0.6%', change: 1.2, aiScore: 71, volatility: 0.25, status: 'normal' },
  { id: 'GDP_EU', name: 'EU GDP', value: '16.8T', change: 0.2, aiScore: 58, volatility: 0.30, status: 'caution' },
  { id: 'INFL_EU', name: 'EU Inflation', value: '2.9%', change: -0.3, aiScore: 73, volatility: 0.15, status: 'normal' },
  { id: 'GDP_CHN', name: 'China GDP', value: '17.8T', change: 4.7, aiScore: 68, volatility: 0.40, status: 'normal' },
  { id: 'PMI_CHN', name: 'China PMI', value: '49.5', change: -1.5, aiScore: 45, volatility: 0.55, status: 'urgent' },
  { id: 'USDCNY', name: 'USD/CNY', value: '7.23', change: 0.15, aiScore: 42, volatility: 0.65, status: 'urgent' },
  { id: 'VIX', name: 'VIX Index', value: '21.35', change: 3.2, aiScore: 38, volatility: 0.85, status: 'urgent' },
];

// Define the provider component
export const WatchlistProvider = ({ children }) => {
  const [watchlistItems, setWatchlistItems] = useState(mockWatchlistData);
  const [sortConfig, setSortConfig] = useState({ key: 'aiScore', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState({ status: 'all' });

  // Sort function for the watchlist
  const sortedWatchlist = React.useMemo(() => {
    let sortableItems = [...watchlistItems];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [watchlistItems, sortConfig]);

  // Filter function for the watchlist
  const filteredWatchlist = React.useMemo(() => {
    if (filterConfig.status === 'all') {
      return sortedWatchlist;
    }
    return sortedWatchlist.filter(item => item.status === filterConfig.status);
  }, [sortedWatchlist, filterConfig]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle filtering
  const requestFilter = (status) => {
    setFilterConfig({ status });
  };

  // Add a new item to the watchlist
  const addWatchlistItem = (item) => {
    setWatchlistItems([...watchlistItems, item]);
  };

  // Remove an item from the watchlist
  const removeWatchlistItem = (id) => {
    setWatchlistItems(watchlistItems.filter(item => item.id !== id));
  };

  // Context value
  const contextValue = {
    watchlistItems: filteredWatchlist,
    requestSort,
    requestFilter,
    addWatchlistItem,
    removeWatchlistItem,
    sortConfig,
    filterConfig
  };

  return (
    <WatchlistContext.Provider value={contextValue}>
      {children}
    </WatchlistContext.Provider>
  );
};

// Custom hook to use the watchlist context
export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

// Actual Watchlist component
const WatchlistComponent = () => {
  // Create its own internal state for standalone use
  const [watchlistItems, setWatchlistItems] = useState(mockWatchlistData);
  const [sortConfig, setSortConfig] = useState({ key: 'aiScore', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState({ status: 'all' });

  // Sort function
  const sortedWatchlist = React.useMemo(() => {
    let sortableItems = [...watchlistItems];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [watchlistItems, sortConfig]);

  // Filter function
  const filteredWatchlist = React.useMemo(() => {
    if (filterConfig.status === 'all') {
      return sortedWatchlist;
    }
    return sortedWatchlist.filter(item => item.status === filterConfig.status);
  }, [sortedWatchlist, filterConfig]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle filtering
  const requestFilter = (status) => {
    setFilterConfig({ status });
  };

  // Get appropriate status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'green';
      case 'caution': return 'orange';
      case 'urgent': return 'red';
      default: return 'gray';
    }
  };

  // Format the change percentage
  const formatChange = (change) => {
    return change > 0 ? `+${change}%` : `${change}%`;
  };

  // Get appropriate color for change percentage
  const getChangeColor = (change) => {
    return change > 0 ? 'green' : change < 0 ? 'red' : 'gray';
  };

  return (
    <div className="watchlist">
      <div className="watchlist-controls">
        <div className="filter-controls">
          <span>Filter by:</span>
          <button 
            onClick={() => requestFilter('all')} 
            className={filterConfig.status === 'all' ? 'active' : ''}
          >
            All
          </button>
          <button 
            onClick={() => requestFilter('normal')} 
            className={filterConfig.status === 'normal' ? 'active' : ''}
          >
            Normal
          </button>
          <button 
            onClick={() => requestFilter('caution')} 
            className={filterConfig.status === 'caution' ? 'active' : ''}
          >
            Caution
          </button>
          <button 
            onClick={() => requestFilter('urgent')} 
            className={filterConfig.status === 'urgent' ? 'active' : ''}
          >
            Urgent
          </button>
        </div>
      </div>
      
      <div className="watchlist-table-container">
        <table className="watchlist-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('name')}>
                Indicator
                {sortConfig.key === 'name' && (
                  <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th onClick={() => requestSort('value')}>
                Value
                {sortConfig.key === 'value' && (
                  <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th onClick={() => requestSort('change')}>
                Change %
                {sortConfig.key === 'change' && (
                  <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th onClick={() => requestSort('aiScore')}>
                AI Score
                {sortConfig.key === 'aiScore' && (
                  <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th onClick={() => requestSort('volatility')}>
                Volatility
                {sortConfig.key === 'volatility' && (
                  <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th onClick={() => requestSort('status')}>
                Status
                {sortConfig.key === 'status' && (
                  <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredWatchlist.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.value}</td>
                <td style={{ color: getChangeColor(item.change) }}>
                  {formatChange(item.change)}
                </td>
                <td>
                  <div className="ai-score">
                    <div className="score-value">{item.aiScore}</div>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ 
                          width: `${item.aiScore}%`,
                          backgroundColor: item.aiScore > 70 ? 'green' : item.aiScore > 50 ? 'orange' : 'red'
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="volatility-bar">
                    <div 
                      className="volatility-fill" 
                      style={{ 
                        width: `${item.volatility * 100}%`,
                        backgroundColor: item.volatility < 0.3 ? 'green' : item.volatility < 0.6 ? 'orange' : 'red'
                      }}
                    ></div>
                  </div>
                </td>
                <td>
                  <span 
                    className="status-tag"
                    style={{ 
                      backgroundColor: getStatusColor(item.status),
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.8rem'
                    }}
                  >
                    {item.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WatchlistComponent;
