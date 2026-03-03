/**
 * Format a time or date value to 12-hour format with AM/PM.
 * Accepts HH:mm[:ss] strings or Date objects.
 */
export const formatTime12h = (value: string | Date): string => {
  const date =
    typeof value === 'string'
      ? new Date(`1970-01-01T${value}`)
      : new Date(value);

  if (isNaN(date.getTime())) return '';

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
};
