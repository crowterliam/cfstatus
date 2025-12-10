/**
 * Utility function to safely format dates with validation
 * @param dateString - The date string to format
 * @param fallback - Fallback text if date is invalid
 * @param context - Context for error logging
 * @returns Formatted date string or fallback
 */
export function formatDateWithValidation(dateString: string, fallback: string, context: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date in ${context}: ${dateString}`);
      return fallback;
    }
    return date.toLocaleString();
  } catch (error) {
    console.error(`Error formatting date in ${context}: ${error}`);
    return fallback;
  }
}