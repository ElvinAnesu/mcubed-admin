/**
 * Format a date string to a more readable format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
export function formatDate(dateString) {
  try {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format options
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString || 'N/A';
  }
}

/**
 * Format currency value
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount) {
  try {
    if (amount === null || amount === undefined) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `$${amount || 0}`;
  }
} 