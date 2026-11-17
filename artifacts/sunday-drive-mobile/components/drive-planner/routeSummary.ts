export function formatRouteSummary(distanceKm: number, durationMin?: number) {
  const distance = `${distanceKm.toFixed(1)} km`;
  if (durationMin === undefined) return distance;

  if (durationMin < 60) return `${distance} · ${durationMin} min`;

  const hours = Math.floor(durationMin / 60);
  const minutes = durationMin % 60;
  const duration = minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
  return `${distance} · ${duration}`;
}
