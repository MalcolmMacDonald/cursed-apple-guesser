type LocationData = {
    fileName: string,
    location: {
        x: number,
        y: number,
        z: number
    }
}

type GameState =
    "landing" |
    "game" |
    "intermediate_scoring" |
    "final_scoring";


export type {LocationData};
export type {GameState};