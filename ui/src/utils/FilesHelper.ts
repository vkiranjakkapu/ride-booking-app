export const formatBytes = (bytes: number, decimals = 1): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Calculates the size of a media item in bytes.
 * Handles Files, genuine Blobs, and strings (Base64 / Data URIs) even if typed loosely.
 */
type MediaInput = File | Blob | string | Record<string, unknown>;

export function getMediaSize(input: MediaInput): string {
    if (!input) return formatBytes(0);

    // 1. If it's a string (Base64 or Data URI)
    if (typeof input === "string") {
        return formatBytes(calculateBase64Size(input));
    }

    // 2. If it's a Blob, File, or an object containing a numeric size property
    if (
        input instanceof Blob ||
        (typeof input === "object" &&
            "size" in input &&
            typeof input.size === "number")
    ) {
        return formatBytes((input as Blob).size);
    }

    // 3. If it's an object wrapping a base64 string property (e.g., { media: "data:image/..." })
    if (typeof input === "object" && input !== null) {
        const record = input as Record<string, unknown>;
        const possibleString = record.media ?? record.data;
        if (typeof possibleString === "string") {
            return formatBytes(calculateBase64Size(possibleString));
        }
    }

    return formatBytes(0);
}

/**
 * Helper to calculate bytes from a Base64 string or Data URI
 */
function calculateBase64Size(base64Input: string): number {
    const base64Content = base64Input.includes("base64,")
        ? base64Input.split("base64,")[1]
        : base64Input;

    const cleanBase64 = base64Content.replace(/\s/g, "");

    let padding = 0;
    if (cleanBase64.endsWith("==")) {
        padding = 2;
    } else if (cleanBase64.endsWith("=")) {
        padding = 1;
    }

    return Math.floor((cleanBase64.length * 3) / 4) - padding;
}
