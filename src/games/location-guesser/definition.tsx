import React from 'react';
import seedRandom from 'seedrandom';
import allLocations from '../../../public/locations/metadata.json';
import GameFinal from '../../game-engine/screens/GameFinal';
import LGRound from './screens/Round';
import LGScoring from './screens/Scoring';
import type {GameDefinition, LandingProps, FinalProps, BaseGameState} from '../../game-engine/types';
import type {LocationData, MapLocation} from '../../types';
import {makeRandomSeed} from '../../utils/rng';
import {getScoreEmoji} from '../../utils/scoring';

const ROUND_COUNT = 5;
const MIRROR_CREDIT = 0.5;
const LG_DAILY_KEY = 'dailyChallenge_completed';

export interface LGGameState extends BaseGameState {
    locations: LocationData[];
    guesses: MapLocation[];
    flips: boolean[];
    mirrorMultiplier: number;
}

function LGLanding({onStart}: LandingProps) {
    const defaultSeed = React.useRef(makeRandomSeed()).current;
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [customSeed, setCustomSeed] = React.useState(defaultSeed);
    const [rounds, setRounds] = React.useState(ROUND_COUNT);

    return (
        <div className="landing">
            <div className="landing__icon">🗺️</div>
            <div className="landing__text">
                <h1 className="landing__title">Location Guesser</h1>
                <p className="landing__subtitle">{rounds} round{rounds !== 1 ? 's' : ''} — guess the location on the
                    map</p>
            </div>
            <button
                className="landing__advanced-toggle"
                onClick={() => setShowAdvanced(s => !s)}
            >
                {showAdvanced ? 'Advanced options ▴' : 'Advanced options ▾'}
            </button>
            {showAdvanced && (
                <div className="landing__advanced">
                    <label className="landing__adv-label">
                        Seed
                        <input
                            className="landing__adv-input"
                            value={customSeed}
                            onChange={e => setCustomSeed(e.target.value)}
                        />
                    </label>
                    <label className="landing__adv-label">
                        Rounds
                        <div className="landing__adv-stepper">
                            <button onClick={() => setRounds(r => Math.max(1, r - 1))}>−</button>
                            <span>{rounds}</span>
                            <button onClick={() => setRounds(r => Math.min(10, r + 1))}>+</button>
                        </div>
                    </label>
                </div>
            )}
            <button className="landing__start-btn" onClick={() => onStart(customSeed || defaultSeed, false, rounds)}>
                Start Game
            </button>
        </div>
    );
}

function LGFinal({state, onPlayAgain, onExit}: FinalProps<LGGameState>) {
    return (
        <GameFinal
            gameName="Location Guesser"
            scores={state.scores}
            totalRounds={state.totalRounds}
            isDaily={state.isDaily}
            dailyDate={state.dailyDate}
            storageKey={LG_DAILY_KEY}
            seed={state.seed}
            maxScorePerRound={5}
            formatShareText={(scores, totalScore, date, url) =>
                [
                    `Deadlock Map Trainer - Location Guesser - ${date}`,
                    scores.map(s => getScoreEmoji(s)).join(' '),
                    `${totalScore}/${scores.length * 5}`,
                    url,
                ].join('\n')
            }
            onPlayAgain={onPlayAgain}
            onExit={onExit}
        />
    );
}

export const locationGuesserDefinition: GameDefinition<LGGameState> = {
    name: 'Location Guesser',
    dailyStorageKey: LG_DAILY_KEY,
    totalRounds: ROUND_COUNT,

    initState(seed, isDaily, roundCount) {
        const count = roundCount ?? ROUND_COUNT;
        const rng = seedRandom(seed);
        const locations = ([...allLocations] as LocationData[]).filter(location => !location.tags.includes("Difficulty/Hard")).sort(() => 0.5 - rng()).slice(0, count);
        return {
            locations,
            guesses: [],
            flips: [],
            scores: [],
            currentRound: 0,
            totalRounds: count,
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
