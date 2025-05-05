// This service would typically be implemented on the backend
// For frontend, we'll create a service that calls your backend API

import axios from 'axios';

// Your backend API endpoint that handles SendGrid integration
const EMAIL_API_ENDPOINT = process.env.REACT_APP_EMAIL_API_ENDPOINT || '/api/send-email';

// Function to send alert emails
export const sendAlertEmail = async (to, subject, content) => {
  try {
    const response = await axios.post(EMAIL_API_ENDPOINT, {
      to,
      subject,
      content,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending alert email:', error);
    throw error;
  }
};

// Function to subscribe to market alerts
export const subscribeToAlerts = async (email, alertTypes) => {
  try {
    const response = await axios.post(`${EMAIL_API_ENDPOINT}/subscribe`, {
      email,
      alertTypes,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error subscribing to alerts:', error);
    throw error;
  }
};

// Function to unsubscribe from market alerts
export const unsubscribeFromAlerts = async (email, alertTypes) => {
  try {
    const response = await axios.post(`${EMAIL_API_ENDPOINT}/unsubscribe`, {
      email,
      alertTypes,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error unsubscribing from alerts:', error);
    throw error;
  }
};