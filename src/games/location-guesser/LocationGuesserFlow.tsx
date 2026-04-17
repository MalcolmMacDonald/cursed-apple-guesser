import React from 'react';
import seedRandom from 'seedrandom';
import allLocations from '../../data/metadata.json';
import seedOverrides from '../../seed-overrides.json';
import Landing from './screens/Landing';
import Round from './screens/Round';
import Scoring from './screens/Scoring';
import Final from './screens/Final';
import type {LocationData, MapLocation, RoundScore} from '../../types';
import {DEFAULT_SCORING_RADIUS} from '../../utils/scoring';
import {makeLocalDate} from '../../utils/rng';

export const LG_ROUND_COUNT = 5;
export const LG_DAILY_KEY = 'dailyChallenge_completed';
export const LG_DAILY_SCORE_KEY = 'dailyChallenge_score';
export const LG_PENDING_SEED_KEY = 'lg_pending_seed';
export const LG_PENDING_DAILY_KEY = 'lg_pending_daily';

export interface LGGameState {
    locations: LocationData[];
    guesses: MapLocation[];
    flips: boolean[];
    undergrounds: boolean[];
    minRadius: number;
    currentRound: number;
    totalRounds: number;
    scores: RoundScore[];
    seed: string;
    isDaily: boolean;
    dailyDate?: string;
}

const overrideMap: Record<string, string[]> = seedOverrides.overrides as Record<string, string[]>;
const locationByFileName = new Map<string, LocationData>(
    (allLocations as LocationData[]).map(loc => [loc.fileName, loc])
);

function initState(seed: string, isDaily: boolean, dailyDate: string, roundCount?: number, minRadius?: number): LGGameState {
    const count = roundCount ?? LG_ROUND_COUNT;
    const radius = minRadius ?? DEFAULT_SCORING_RADIUS;
    const effectiveSeed = isDaily ? `${dailyDate}-daily` : seed;

    let locations: LocationData[];
    if (overrideMap[effectiveSeed]) {
        locations = overrideMap[effectiveSeed]
            .map(fileName => locationByFileName.get(fileName))
            .filter((loc): loc is LocationData => loc !== undefined)
            .slice(0, count);
    } else {
        const rng = seedRandom(effectiveSeed);
        const availableLocations = ([...allLocations] as LocationData[]).filter(
            location => !location.tags.includes('Difficulty/Hard')
        );
        const availableIndices = availableLocations.map((_, i) => i);
        const locationIndices = [];
        for (let i = 0; i < count; i++) {
            const indexInArray = Math.floor(rng() * availableLocations.length);
            const index = availableIndices[indexInArray];
            locationIndices.push(index);
            availableIndices.splice(indexInArray, 1);
        }
        locations = locationIndices.map(i => availableLocations[i]);
    }
    return {
        locations,
        guesses: [],
        flips: [],
        undergrounds: [],
        scores: [],
        currentRound: 0,
        totalRounds: count,
        seed: effectiveSeed,
        isDaily,
        dailyDate: isDaily ? dailyDate : undefined,
        minRadius: radius,
    };
}

type LGView = 'landing' | 'round' | 'score' | 'final';

function LocationGuesserFlow() {
    const [view, setView] = React.useState<LGView>('landing');
    const [state, setState] = React.useState<LGGameState | null>(null);

    // On first mount, check for a pending seed stored by the hub
    React.useEffect(() => {
        const seed = sessionStorage.getItem(LG_PENDING_SEED_KEY);
        const isDaily = sessionStorage.getItem(LG_PENDING_DAILY_KEY) === 'true';
        if (seed) {
            sessionStorage.removeItem(LG_PENDING_SEED_KEY);
            sessionStorage.removeItem(LG_PENDING_DAILY_KEY);
            setState(initState(seed, isDaily, isDaily ? makeLocalDate() : ''));
            setView('round');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleStart(seed: string, isDaily: boolean, dailyDate: string, roundCount?: number, minRadius?: number) {
        setState(initState(seed, isDaily, dailyDate, roundCount, minRadius));
        setView('round');
    }

    function handleRoundSubmit(updatedState: LGGameState) {
        setState(updatedState);
        setView('score');
    }

    function handleScoringContinue(score: RoundScore) {
        const newState = {
            ...state!,
            scores: [...state!.scores, score],
            currentRound: state!.currentRound + 1,
        };
        setState(newState);
        setView(newState.currentRound >= newState.totalRounds ? 'final' : 'round');
    }

    function handlePlayAgain() {
        setState(null);
        setView('landing');
    }

    const onExit = () => { window.location.href = import.meta.env.BASE_URL; };

    return (
        <>
            {view === 'landing' && (
                <Landing onStart={handleStart} onExit={onExit}/>
            )}
            {view === 'round' && state !== null && (
                <Round state={state} onSubmit={handleRoundSubmit}/>
            )}
            {view === 'score' && state !== null && (
                <Scoring state={state} onContinue={handleScoringContinue}/>
            )}
            {view === 'final' && state !== null && (
                <Final state={state} onPlayAgain={handlePlayAgain} onExit={onExit}/>
            )}
        </>
    );
}

export default LocationGuesserFlow;
