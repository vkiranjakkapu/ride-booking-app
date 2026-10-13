/**
 * Transforms distance in metres into readable text
 * (e.g. 250 -> "250 m", 1500 -> "1.5 km", 12500 -> "12.5 km").
 */
export function formatDistance(distanceInMeters?: number | null): string {
    if (distanceInMeters == null || !Number.isFinite(distanceInMeters)) {
        return "0 m";
    }

    const distance = Math.max(0, distanceInMeters);

    if (distance < 1000) {
        return `${Math.round(distance)} m`;
    }

    const distanceInKm = distance / 1000;

    return `${Number(distanceInKm.toFixed(1))} km`;
}
