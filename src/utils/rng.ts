import seedRandom from 'seedrandom';

/** Returns today's date as YYYY-MM-DD. Used as the daily challenge seed. */
export function makeDailyDate(): string {
    return new Date().toISOString().split('T')[0] + "-daily";
}

/** Generates a random numeric seed string. Call once at component init time. */
export function makeRandomSeed(): string {
    return (seedRandom()() * 1000).toFixed(0);
}
