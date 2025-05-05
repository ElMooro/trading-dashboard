// WatchlistContext.js
import React, { createContext, useState, useEffect } from 'react';

export const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState(() => {
    // Load from localStorage if available
    const savedWatchlist = localStorage.getItem('watchlist');
    return savedWatchlist ? JSON.parse(savedWatchlist) : [];
  });

  // Save to localStorage whenever watchlist changes
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Add to watchlist
  const addToWatchlist = (indicator) => {
    if (!watchlist.some(item => item.seriesId === indicator.seriesId)) {
      setWatchlist([...watchlist, indicator]);
    }
  };

  // Remove from watchlist
  const removeFromWatchlist = (seriesId) => {
    setWatchlist(watchlist.filter(item => item.seriesId !== seriesId));
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export default WatchlistContext;