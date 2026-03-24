import React from 'react';
import seedRandom from 'seedrandom';
import allLocations from '../../../public/locations/metadata.json';
import GameFinal from '../../game-engine/screens/GameFinal';
import LGRound from './screens/Round';
import LGScoring from './screens/Scoring';
import type {GameDefinition, LandingProps, FinalProps, BaseGameState} from '../../game-engine/types';
import type {LocationData, MapLocation} from '../../types';
import {makeRandomSeed} from '../../utils/rng';
import {getGolfScoreEmoji, DEFAULT_SCORING_RADIUS} from '../../utils/scoring';

const ROUND_COUNT = 5;
export const LG_DAILY_KEY = 'dailyChallenge_completed';

export interface LGGameState extends BaseGameState {
    locations: LocationData[];
    guesses: MapLocation[];
    flips: boolean[];
    undergrounds: boolean[];
    minRadius: number;
}

function LGLanding({onStart}: LandingProps) {
    const defaultSeed = React.useRef(makeRandomSeed()).current;
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [customSeed, setCustomSeed] = React.useState(defaultSeed);
    const [rounds, setRounds] = React.useState(ROUND_COUNT);
    const [minRadius, setMinRadius] = React.useState(DEFAULT_SCORING_RADIUS);

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
                    {import.meta.env.DEV && (
                        <label className="landing__adv-label">
                            Scoring Radius
                            <div className="landing__adv-stepper">
                                <button onClick={() => setMinRadius(r => Math.max(100, r - 100))}>−</button>
                                <span>{minRadius}</span>
                                <button onClick={() => setMinRadius(r => Math.min(10900, r + 100))}>+</button>
                            </div>
                        </label>
                    )}
                </div>
            )}
            <button className="landing__start-btn" onClick={() => onStart(customSeed || defaultSeed, false, rounds, minRadius)}>
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
            maxScorePerRound={3}
            formatShareText={(isDaily, scores, totalScore, seed, date, url) =>
                [
                    isDaily ? `Deadlock Location Guesser Daily - ${date}` : `Deadlock Location Guesser`,
                    scores.map(s => getGolfScoreEmoji(s.score)).join(' '),
                    totalScore == scores.length ? `Perfect score!` :`${totalScore}/${scores.length * 3} (lower is better)`,
                    !isDaily ? `Seed: ${seed}` : "",
                    url,
                ].filter(line  => line.length > 0)
                    .join('\n')
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

    initState(seed, isDaily, roundCount, minRadius) {
        const count = roundCount ?? ROUND_COUNT;
        const radius = minRadius ?? DEFAULT_SCORING_RADIUS;
        const rng = seedRandom(seed);
        const locations = ([...allLocations] as LocationData[]).filter(location => !location.tags.includes("Difficulty/Hard")).sort(() => 0.5 - rng()).slice(0, count);
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
            dailyDate: isDaily ? seed : undefined,
            minRadius: radius,
        };
    },

    screens: {
        Landing: LGLanding,
        Round: LGRound as React.FC<any>,
        Scoring: LGScoring as React.FC<any>,
        Final: LGFinal as React.FC<any>,
    },
};
