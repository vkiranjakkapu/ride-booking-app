/**
 * Transforms duration in seconds into readable text
 * (e.g. 3 -> "3 secs", 105 -> "1 min 45 secs",
 * 3720 -> "1 hr 2 mins").
 */
export function formatDurationTaken(durationInSeconds?: number | null): string {
    if (durationInSeconds == null || !Number.isFinite(durationInSeconds)) {
        return "0 secs";
    }

    const totalSeconds = Math.max(0, Math.floor(durationInSeconds));

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];

    if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? "hr" : "hrs"}`);
    }

    if (minutes > 0) {
        parts.push(`${minutes} ${minutes === 1 ? "min" : "mins"}`);
    }

    if (seconds > 0 || parts.length === 0) {
        parts.push(`${seconds} ${seconds === 1 ? "sec" : "secs"}`);
    }

    return parts.join(" ");
}