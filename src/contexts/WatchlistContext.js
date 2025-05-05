// src/contexts/WatchlistContext.js
import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const WatchlistContext = createContext(); // Export as named export

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);
  
  // Add to watchlist function
  const addToWatchlist = (item) => {
    if (!watchlist.some(existingItem => existingItem.seriesId === item.seriesId)) {
      setWatchlist([...watchlist, item]);
    }
  };
  
  // Remove from watchlist function
  const removeFromWatchlist = (seriesId) => {
    setWatchlist(watchlist.filter(item => item.seriesId !== seriesId));
  };
  
  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
};
