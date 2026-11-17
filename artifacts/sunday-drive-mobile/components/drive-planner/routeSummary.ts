export function formatDistance(
  distanceKm?: number | null,
  unit: 'mi' | 'km' = 'mi',
) {
  if (distanceKm === undefined || distanceKm === null) return '';
  const value = unit === 'mi' ? distanceKm / 1.609344 : distanceKm;
  return `${value.toFixed(1)} ${unit}`;
}

export function formatRouteSummary(
  distanceKm?: number | null,
  durationMin?: number,
) {
  const distance = formatDistance(distanceKm);
  if (durationMin === undefined) return distance;

  const duration =
    durationMin < 60
      ? `${durationMin} min`
      : `${Math.floor(durationMin / 60)} h${
          durationMin % 60 === 0 ? '' : ` ${durationMin % 60} min`
        }`;

  return distance ? `${distance} · ${duration}` : duration;
}
