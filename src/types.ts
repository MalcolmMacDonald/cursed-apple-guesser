export type LocationData = {
    fileName: string;
    location: MapLocation;
};

export type MapLocation = {
    x: number;
    y: number;
};

export type NavigationStep =
    | { type: 'move'; distance: 'short' | 'medium' | 'long' }
    | { type: 'turn'; direction: 'left' | 'right' | 'uturn' };
