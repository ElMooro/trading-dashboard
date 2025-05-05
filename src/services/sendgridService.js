// src/services/sendgridService.js
// This is a client-side proxy to a backend service that actually sends the emails

/**
 * Send an alert email using SendGrid
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Email message
 */
export const sendAlertEmail = async (to, subject, message) => {
    try {
      if (!to) {
        throw new Error('Email recipient is required');
      }
      
      // In a real implementation, this would call your backend API
      // that handles SendGrid authentication securely
      const response = await fetch('/api/send-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          message
        }),
      });
      
      const result = await response.json();
      
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Error sending email alert:', error);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Send a test email to verify configuration
   * @param {string} to - Recipient email 
   */
  export const sendTestEmail = async (to) => {
    return sendAlertEmail(
      to,
      'Trading Dashboard Test Alert',
      'This is a test alert from your Trading Dashboard. If you received this, your alert system is configured correctly.'
    );
  };