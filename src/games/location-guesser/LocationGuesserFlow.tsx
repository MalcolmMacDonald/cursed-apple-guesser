import React from 'react';
import {useLocation} from 'wouter';
import seedRandom from 'seedrandom';
import allLocations from '../../../public/locations/metadata.json';
import seedOverrides from '../../seed-overrides.json';
import Landing from './screens/Landing';
import Round from './screens/Round';
import Scoring from './screens/Scoring';
import Final from './screens/Final';
import type {LocationData, MapLocation, RoundScore} from '../../types';
import {DEFAULT_SCORING_RADIUS} from '../../utils/scoring';
import {makeLocalDate} from '../../utils/rng';

export const LG_ROUND_COUNT = 5;
const ROUND_COUNT = LG_ROUND_COUNT;
export const LG_DAILY_KEY = 'dailyChallenge_completed';
export const LG_DAILY_SCORE_KEY = 'dailyChallenge_score';

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
    const count = roundCount ?? ROUND_COUNT;
    const radius = minRadius ?? DEFAULT_SCORING_RADIUS;
    if (isDaily) {
        seed = dailyDate + "-daily";
    }
    let locations: LocationData[];
    if (overrideMap[seed]) {
        locations = overrideMap[seed]
            .map(fileName => locationByFileName.get(fileName))
            .filter((loc): loc is LocationData => loc !== undefined)
            .slice(0, count);
    } else {
        const rng = seedRandom(seed);
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
        console.log(locationIndices);
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
        seed,
        isDaily,
        dailyDate: isDaily ? dailyDate : undefined,
        minRadius: radius,
    };
}

function LocationGuesserFlow() {
    const [location, navigate] = useLocation();
    const [state, setState] = React.useState<LGGameState | null>(null);

    // On first mount at /play, check for daily challenge query params
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const seed = params.get('seed');
        const isDaily = params.get('daily') === 'true';
        if (seed) {
            setState(initState(seed, isDaily, isDaily ? makeLocalDate() : ''));
            navigate('/play/round');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Guard: redirect to landing if at a sub-route without state
    React.useEffect(() => {
        if (location !== '/play' && state === null) {
            navigate('/play');
        }
    }, [location, state, navigate]);

    function handleStart(seed: string, isDaily: boolean, dailyDate: string, roundCount?: number, minRadius?: number) {
        setState(initState(seed, isDaily, dailyDate, roundCount, minRadius));
        navigate('/play/round');
    }

    function handleRoundSubmit(updatedState: LGGameState) {
        setState(updatedState);
        navigate('/play/score');
    }

    function handleScoringContinue(score: RoundScore) {
        const newState = {
            ...state!,
            scores: [...state!.scores, score],
            currentRound: state!.currentRound + 1,
        };
        setState(newState);
        navigate(newState.currentRound >= newState.totalRounds ? '/play/final' : '/play/round');
    }

    function handlePlayAgain() {
        setState(null);
        navigate('/play');
    }

    const onExit = () => navigate('/');

    return (
        <>
            {location === '/play' && (
                <Landing onStart={handleStart} onExit={onExit}/>
            )}
            {location === '/play/round' && state !== null && (
                <Round state={state} onSubmit={handleRoundSubmit}/>
            )}
            {location === '/play/score' && state !== null && (
                <Scoring state={state} onContinue={handleScoringContinue}/>
            )}
            {location === '/play/final' && state !== null && (
                <Final state={state} onPlayAgain={handlePlayAgain} onExit={onExit}/>
            )}
        </>
    );
}

export default LocationGuesserFlow;
