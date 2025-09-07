export type LocationData = {
    fileName: string,
    location: MapLocation
}
export type MapLocation = {
    x: number,
    y: number
}

export type GameScreenName =
    "landing" |
    "game" |
    "intermediate_scoring" |
    "final_scoring";

export type GameData = {
    locations: LocationData[],
    currentRound: number,
    totalRounds: number,
    scores: number[],
    guesses: MapLocation[],
    seed: any
}
