export function parseDuration(str: string): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = str.match(regex);
    if (!match) {
        throw new Error(`Invalid duration: ${str}`);
    }
    const [, num, unit] = match;
    const n = Number(num);
    switch (unit) {
        case "ms": return n;
        case "s": return n * 1_000;
        case "m": return n * 60_000;
        case "h": return n * 3_600_000;
        default: throw new Error(`Unknown unit: ${unit}`);
    }
}
