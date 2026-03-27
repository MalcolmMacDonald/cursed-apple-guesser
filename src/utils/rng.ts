import seedRandom from 'seedrandom';

const PST_OFFSET_MS = 8 * 60 * 60 * 1000;

/** Returns today's date as YYYY-MM-DD in PST (UTC-8). */
export function makePSTDate(): string {
    return new Date(Date.now() - PST_OFFSET_MS).toISOString().split('T')[0];
}

/** Returns today's date as YYYY-MM-DD-daily in PST (UTC-8). Used as the daily challenge seed. */
export function makeDailyDate(): string {
    return makePSTDate() + "-daily";
}

/** Returns the Unix timestamp (ms) of the next midnight in PST (UTC-8). */
export function nextPSTMidnightMs(): number {
    const nowPST = new Date(Date.now() - PST_OFFSET_MS);
    nowPST.setUTCHours(24, 0, 0, 0);
    return nowPST.getTime() + PST_OFFSET_MS;
}

/** Generates a random numeric seed string. Call once at component init time. */
export function makeRandomSeed(): string {
    return (seedRandom()() * 1000).toFixed(0);
}
