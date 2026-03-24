import React from 'react';
import seedRandom from 'seedrandom';
import allLocations from '../../../public/locations/metadata.json';
import GameLanding from '../../game-engine/screens/GameLanding';
import GameFinal from '../../game-engine/screens/GameFinal';
import DRRound from './screens/Round';
import DRScoring from './screens/Scoring';
import type {GameDefinition, LandingProps, FinalProps, BaseGameState} from '../../game-engine/types';
import type {LocationData, NavigationStep} from '../../types';

const ROUND_COUNT = 5;
const CARDINALS = [0, 90, 180, 270] as const;
export const DR_DAILY_KEY = 'drDaily_completed';

export type LocationPair = { start: LocationData; end: LocationData };

export interface DRGameState extends BaseGameState {
    pairs: LocationPair[];
    allSteps: NavigationStep[][];
    startFacings: number[];
}

function DRLanding(props: LandingProps) {
    return (
        <GameLanding
            {...props}
            icon="🧭"
            title="Dead Reckoning"
            subtitle="5 rounds — navigate from start to destination"
        />
    );
}

function DRFinal({state, onPlayAgain, onExit}: FinalProps<DRGameState>) {
    return (
        <GameFinal
            gameName="Dead Reckoning"
            scores={state.scores}
            totalRounds={state.totalRounds}
            isDaily={state.isDaily}
            dailyDate={state.dailyDate}
            storageKey={DR_DAILY_KEY}
            formatShareText={(isDaily, scores, totalScore, seed, date, url) =>
                [
                    isDaily ? `Deadlock Map Trainer - Dead Reckoning - ${date} - ${url}` : `Deadlock Map Trainer - Dead Reckoning - Seed ${seed}- ${url}`,
                    ...scores.map((s, i) => `Round ${i + 1}: ${s} / 1000`),
                    `Total: ${totalScore} / ${scores.length * 1000}`,
                ].join('\n')
            }
            onPlayAgain={onPlayAgain}
            onExit={onExit}
        />
    );
}

function pickPairsAndFacings(rng: () => number): { pairs: LocationPair[]; facings: number[] } {
    const shuffled = ([...allLocations] as LocationData[]).sort(() => 0.5 - rng());
    const pairs: LocationPair[] = [];
    for (let i = 0; i < ROUND_COUNT; i++) {
        pairs.push({start: shuffled[i], end: shuffled[i + ROUND_COUNT]});
    }
    const facings = Array.from(
        {length: ROUND_COUNT},
        () => CARDINALS[Math.floor(rng() * 4)]
    );
    return {pairs, facings};
}

export const deadReckoningDefinition: GameDefinition<DRGameState> = {
    name: 'Dead Reckoning',
    dailyStorageKey: DR_DAILY_KEY,
    totalRounds: ROUND_COUNT,

    initState(seed, isDaily) {
        const rng = seedRandom(seed);
        const {pairs, facings} = pickPairsAndFacings(rng);
        return {
            pairs,
            allSteps: [],
            startFacings: facings,
            scores: [],
            currentRound: 0,
            totalRounds: ROUND_COUNT,
            seed,
            isDaily,
            dailyDate: isDaily ? seed : undefined,
        };
    },

    screens: {
        Landing: DRLanding,
        Round: DRRound as React.FC<any>,
        Scoring: DRScoring as React.FC<any>,
        Final: DRFinal as React.FC<any>,
    },
};
