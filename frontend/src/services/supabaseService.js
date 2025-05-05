import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// User authentication
export const signUp = async (email, password) => {
  try {
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// User preferences
export const saveUserPreferences = async (userId, preferences) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preferences,
        updated_at: new Date(),
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
};

export const getUserPreferences = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
    
    return data?.preferences || null;
  } catch (error) {
    console.error('Error loading user preferences:', error);
    throw error;
  }
};

// Watchlist management
export const saveWatchlist = async (userId, watchlist) => {
  try {
    const { data, error } = await supabase
      .from('watchlists')
      .upsert({
        user_id: userId,
        items: watchlist,
        updated_at: new Date(),
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving watchlist:', error);
    throw error;
  }
};

export const getWatchlist = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('watchlists')
      .select('items')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return data?.items || [];
  } catch (error) {
    console.error('Error loading watchlist:', error);
    throw error;
  }
};