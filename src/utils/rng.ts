import seedRandom from 'seedrandom';

/** Returns today's date as YYYY-MM-DD in PST (UTC-8). Used as the daily challenge seed. */
export function makeDailyDate(): string {
    const PST_OFFSET_MS = 8 * 60 * 60 * 1000;
    const pstDate = new Date(Date.now() - PST_OFFSET_MS);
    return pstDate.toISOString().split('T')[0] + "-daily";
}

/** Generates a random numeric seed string. Call once at component init time. */
export function makeRandomSeed(): string {
    return (seedRandom()() * 1000).toFixed(0);
}
