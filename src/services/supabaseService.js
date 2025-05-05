// src/services/supabaseService.js
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// User-related functions
export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting user session:', error);
    return null;
  }
  
  return session?.user || null;
};

export const getUserPreferences = async (userId) => {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
  
  return data;
};

// Watchlist functions
export const getWatchlist = async (userId) => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
  
  return data;
};

// Annotations and drawings
export const saveAnnotation = async (userId, seriesId, annotation) => {
  if (!userId) return { success: false, error: 'User not authenticated' };
  
  const { data, error } = await supabase
    .from('user_annotations')
    .insert([{
      user_id: userId,
      series_id: seriesId,
      text: annotation.text,
      price: annotation.price,
      date: annotation.date.toISOString(),
      color: annotation.color,
      tool: annotation.tool
    }]);
    
  if (error) {
    console.error('Error saving annotation:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data };
};

export const getAnnotations = async (userId, seriesId) => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('user_annotations')
    .select('*')
    .eq('user_id', userId)
    .eq('series_id', seriesId);
    
  if (error) {
    console.error('Error fetching annotations:', error);
    return [];
  }
  
  return data.map(ann => ({
    ...ann,
    date: new Date(ann.date)
  }));
};

// Alerts
export const saveAlert = async (userId, seriesId, alert) => {
  if (!userId) return { success: false, error: 'User not authenticated' };
  
  const { data, error } = await supabase
    .from('user_alerts')
    .insert([{
      user_id: userId,
      series_id: seriesId,
      condition: alert.condition,
      value: alert.value,
      email: alert.email,
      message: alert.message,
      active: alert.active
    }]);
    
  if (error) {
    console.error('Error saving alert:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data };
};

export const getAlerts = async (userId, seriesId) => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('user_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('series_id', seriesId);
    
  if (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
  
  return data;
};

// User history
export const saveToHistory = async (userId, seriesId, title, source) => {
  if (!userId) return { success: false };
  
  try {
    await supabase.from('user_history').insert([{
      user_id: userId,
      series_id: seriesId,
      title,
      source,
      viewed_at: new Date().toISOString()
    }]);
    
    return { success: true };
  } catch (error) {
    console.error("Error saving to history:", error);
    return { success: false };
  }
};