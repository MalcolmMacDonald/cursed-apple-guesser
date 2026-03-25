export type LocationData = {
    fileName: string;
    tags: string[];
    location: MapLocation;
};

export type MapLocation = {
    x: number;
    y: number;
};

export type RoundScore = {
    score: number;
    maxScore: number;
};
