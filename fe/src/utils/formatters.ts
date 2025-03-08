/**
 * Format power value in watts with appropriate units
 */
export function formatWatts(power: number): string {
  if (power < 1000) {
    return `${power.toFixed(0)} W`;
  } else {
    return `${(power / 1000).toFixed(1)} kW`;
  }
}

/**
 * Format energy value in kilowatt-hours
 */
export function formatKilowattHours(kwh: number): string {
  return `${kwh.toFixed(1)} kWh`;
}

/**
 * Format date for chart labels
 */
export function formatChartDate(dateStr: string, period: '24h' | 'week' | 'month'): string {
  const date = new Date(dateStr);
  
  if (period === '24h') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

/**
 * Format current value in amperes
 */
export function formatAmps(current: number = 0): string {
  return `${current.toFixed(1)} A`;
}