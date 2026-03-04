import type { NavigationStep } from '../../types';
import type { MapLocation } from '../../types';

export const STEP_DISTANCES = { short: 1500, medium: 3500, long: 6000 } as const;

export const FACING_INFO: Record<number, { label: string; arrow: string }> = {
    0: { label: 'NORTH', arrow: '↑' },
    90: { label: 'EAST', arrow: '→' },
    180: { label: 'SOUTH', arrow: '↓' },
    270: { label: 'WEST', arrow: '←' },
};

export function applyTurn(facing: number, dir: 'left' | 'right' | 'uturn'): number {
    if (dir === 'left') return (facing - 90 + 360) % 360;
    if (dir === 'right') return (facing + 90) % 360;
    return (facing + 180) % 360;
}

export function getStepLabel(steps: NavigationStep[], index: number, startFacing: number): string {
    let facing = startFacing;
    for (let i = 0; i < index; i++) {
        const s = steps[i];
        if (s.type === 'turn') facing = applyTurn(facing, s.direction);
    }
    const step = steps[index];
    if (step.type === 'turn') {
        if (step.direction === 'left') return '← Turn Left';
        if (step.direction === 'right') return 'Turn Right →';
        return '↔ U-Turn';
    }
    const dirs = ['N', 'E', 'S', 'W'];
    const dir = dirs[Math.round(facing / 90) % 4];
    const dist = step.distance.charAt(0).toUpperCase() + step.distance.slice(1);
    return `Walk ${dist} (${dir})`;
}

export function simulatePath(start: MapLocation, startFacing: number, steps: NavigationStep[]): MapLocation[] {
    let x = start.x;
    let y = start.y;
    let facing = startFacing;
    const waypoints: MapLocation[] = [{ x, y }];

    for (const step of steps) {
        if (step.type === 'turn') {
            facing = applyTurn(facing, step.direction);
        } else {
            const distance = STEP_DISTANCES[step.distance];
            const rad = (facing * Math.PI) / 180;
            x += distance * Math.sin(rad); // East component
            y += distance * Math.cos(rad); // North component
            waypoints.push({ x, y });
        }
    }
    return waypoints;
}
