import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const WatchlistContext = createContext();

// Create a provider component
export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load watchlist from localStorage or API
    const loadWatchlist = async () => {
      try {
        // For demo purposes, we'll just use some sample data
        const sampleWatchlist = [
          { id: 'GDP', name: 'US GDP', value: '26.14T', change: '+2.1%', aiScore: 78, volatility: 0.3, status: 'stable' },
          { id: 'INFL', name: 'Inflation Rate', value: '3.2%', change: '-0.4%', aiScore: 65, volatility: 0.5, status: 'improving' },
          { id: 'UNEMP', name: 'Unemployment', value: '3.8%', change: '+0.1%', aiScore: 72, volatility: 0.2, status: 'stable' }
        ];
        
        setWatchlist(sampleWatchlist);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading watchlist:', error);
        setIsLoading(false);
      }
    };

    loadWatchlist();
  }, []);

  // Add item to watchlist
  const addToWatchlist = (item) => {
    setWatchlist((prev) => [...prev, item]);
  };

  // Remove item from watchlist
  const removeFromWatchlist = (itemId) => {
    setWatchlist((prev) => prev.filter(item => item.id !== itemId));
  };

  return (
    <WatchlistContext.Provider 
      value={{ 
        watchlist, 
        isLoading, 
        addToWatchlist, 
        removeFromWatchlist 
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

// Custom hook for using the watchlist context
export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}

// Export the context itself
export { WatchlistContext };
