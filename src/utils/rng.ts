import seedRandom from 'seedrandom';

/** Returns today's date as YYYY-MM-DD in the user's local timezone. */
export function makeLocalDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/** Returns today's date as YYYY-MM-DD-daily in the user's local timezone. Used as the daily challenge seed. */
export function makeDailyDate(): string {
    return makeLocalDate() + "-daily";
}

/** Returns the Unix timestamp (ms) of the next local midnight. */
export function nextLocalMidnightMs(): number {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
}

/** Generates a random numeric seed string. Call once at component init time. */
export function makeRandomSeed(): string {
    return (seedRandom()() * 1000).toFixed(0);
}
