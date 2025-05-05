// src/contexts/WatchlistContext.js
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService';

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check for authenticated user
    const getUserAndWatchlist = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setCurrentUser(session.user);
        
        // Load watchlist
        const { data: watchlistData, error } = await supabase
          .from('watchlist')
          .select('*')
          .eq('user_id', session.user.id);
          
        if (!error && watchlistData) {
          setWatchlist(watchlistData);
        }
      }
    };
    
    getUserAndWatchlist();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setCurrentUser(session.user);
          const { data: watchlistData } = await supabase
            .from('watchlist')
            .select('*')
            .eq('user_id', session.user.id);
            
          if (watchlistData) {
            setWatchlist(watchlistData);
          }
        } else {
          setCurrentUser(null);
          setWatchlist([]);
        }
      }
    );
    
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  const addToWatchlist = async (item) => {
    if (!currentUser) {
      console.error('User must be logged in to add to watchlist');
      return false;
    }
    
    const { data, error } = await supabase
      .from('watchlist')
      .insert([{
        user_id: currentUser.id,
        series_id: item.seriesId,
        title: item.title,
        description: item.description,
        source: item.source,
        latest_value: item.latestValue,
        change: item.change
      }]);
      
    if (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
    
    setWatchlist([...watchlist, item]);
    return true;
  };
  
  const removeFromWatchlist = async (seriesId) => {
    if (!currentUser) {
      console.error('User must be logged in to remove from watchlist');
      return false;
    }
    
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('series_id', seriesId);
      
    if (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
    
    setWatchlist(watchlist.filter(item => item.seriesId !== seriesId));
    return true;
  };
  
  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, currentUser }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export default WatchlistContext;