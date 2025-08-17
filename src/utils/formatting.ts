/**
 * Safely parses a number value, handling both string and number inputs
 * @param value - The value to parse
 * @returns Parsed number or NaN if invalid
 */
const parseNumberValue = (value: number | string): number => {
  return typeof value === 'string' ? parseFloat(value) : value;
};

/**
 * Formats a number with proper commas, periods, and decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted string
 */
export const formatNumber = (
  value: number | string,
  decimals: number = 2,
  locale: string = 'en-US'
): string => {
  const numValue = parseNumberValue(value);
  
  if (isNaN(numValue)) {
    return '0.00';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
};

/**
 * Formats currency values with proper formatting
 * @param value - The number to format
 * @param currency - Currency code (default: 'USD')
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | string,
  currency: string = 'USD',
  decimals: number = 2,
  locale: string = 'en-US'
): string => {
  const numValue = parseNumberValue(value);
  
  if (isNaN(numValue)) {
    return '$0.00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
};

/**
 * Formats large numbers with K, M, B suffixes for better readability
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with suffix
 */
export const formatCompactNumber = (
  value: number | string,
  decimals: number = 1
): string => {
  const numValue = parseNumberValue(value);
  
  if (isNaN(numValue)) {
    return '0';
  }

  const absValue = Math.abs(numValue);
  
  if (absValue >= 1e9) {
    return (numValue / 1e9).toFixed(decimals) + 'B';
  } else if (absValue >= 1e6) {
    return (numValue / 1e6).toFixed(decimals) + 'M';
  } else if (absValue >= 1e3) {
    return (numValue / 1e3).toFixed(decimals) + 'K';
  } else {
    return numValue.toFixed(decimals);
  }
};

/**
 * Formats percentage values with proper decimal places
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number | string,
  decimals: number = 2
): string => {
  const numValue = parseNumberValue(value);
  
  if (isNaN(numValue)) {
    return '0.00%';
  }

  return `${numValue.toFixed(decimals)}%`;
};