// Time and Timezone Utilities

export function tzMidnight(tz: string, now: Date = new Date()): Date {
  // Get the start of today in the given timezone
  const today = new Date(now.toLocaleString("en-US", { timeZone: tz }));
  today.setHours(0, 0, 0, 0);
  
  // Convert back to UTC
  const utcOffset = today.getTimezoneOffset() * 60000;
  const localOffset = new Date(now.toLocaleString("en-US", { timeZone: tz })).getTime() - now.getTime();
  
  return new Date(today.getTime() - utcOffset + localOffset);
}

export function getLocalMidnight(tz: string, now: Date = new Date()): Date {
  // Get local midnight in venue timezone
  const localTime = new Date(now.toLocaleString("en-US", { timeZone: tz }));
  localTime.setHours(0, 0, 0, 0);
  return localTime;
}

export function getTomorrowMidnight(tz: string, now: Date = new Date()): Date {
  const today = getLocalMidnight(tz, now);
  return new Date(today.getTime() + 24 * 60 * 60 * 1000);
}

export function isToday(timestamp: string, tz: string, now: Date = new Date()): boolean {
  const postTime = new Date(timestamp);
  const todayStart = getLocalMidnight(tz, now);
  const todayEnd = getTomorrowMidnight(tz, now);
  
  return postTime >= todayStart && postTime < todayEnd;
}

export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}