import React from 'react';
import seedRandom from 'seedrandom';
import allLocations from '../../locations/metadata.json';
import GameLanding from '../../game-engine/screens/GameLanding';
import GameFinal from '../../game-engine/screens/GameFinal';
import LGRound from './screens/Round';
import LGScoring from './screens/Scoring';
import type { GameDefinition, LandingProps, FinalProps, BaseGameState } from '../../game-engine/types';
import type { LocationData, MapLocation } from '../../types';

const ROUND_COUNT = 5;
const MIRROR_CREDIT = 0.5;
const LG_DAILY_KEY = 'dailyChallenge_completed';

export interface LGGameState extends BaseGameState {
    locations: LocationData[];
    guesses: MapLocation[];
    mirrorMultiplier: number;
}

function LGLanding(props: LandingProps) {
    return (
        <GameLanding
            {...props}
            icon="🗺️"
            title="Location Guesser"
            subtitle="5 rounds — guess the location on the map"
            storageKey={LG_DAILY_KEY}
        />
    );
}

function LGFinal({ state, onPlayAgain }: FinalProps<LGGameState>) {
    return (
        <GameFinal
            gameName="Location Guesser"
            scores={state.scores}
            totalRounds={state.totalRounds}
            isDaily={state.isDaily}
            dailyDate={state.dailyDate}
            storageKey={LG_DAILY_KEY}
            formatShareText={(scores, totalScore, date, url) =>
                [
                    `Deadlock Map Trainer - Location Guesser - ${date} - ${url}`,
                    ...scores.map((s, i) => `Round ${i + 1}: ${s} / 1000`),
                    `Total: ${totalScore} / ${scores.length * 1000}`,
                ].join('\n')
            }
            onPlayAgain={onPlayAgain}
        />
    );
}

export const locationGuesserDefinition: GameDefinition<LGGameState> = {
    name: 'Location Guesser',
    dailyStorageKey: LG_DAILY_KEY,
    totalRounds: ROUND_COUNT,

    initState(seed, isDaily) {
        const rng = seedRandom(seed);
        const locations = ([...allLocations] as LocationData[]).sort(() => 0.5 - rng()).slice(0, ROUND_COUNT);
        return {
            locations,
            guesses: [],
            scores: [],
            currentRound: 0,
            totalRounds: ROUND_COUNT,
            mirrorMultiplier: MIRROR_CREDIT,
            seed,
            isDaily,
            dailyDate: isDaily ? seed : undefined,
        };
    },

    screens: {
        Landing: LGLanding,
        Round: LGRound as React.FC<any>,
        Scoring: LGScoring as React.FC<any>,
        Final: LGFinal as React.FC<any>,
    },
};
