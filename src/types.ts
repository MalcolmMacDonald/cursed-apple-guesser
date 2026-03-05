export type LocationData = {
    fileName: string;
    tags: string[];
    location: MapLocation;
};

export type MapLocation = {
    x: number;
    y: number;
};

export type NavigationStep =
    | { type: 'move'; distance: 'short' | 'medium' | 'long' }
    | { type: 'turn'; direction: 'left' | 'right' | 'uturn' };
