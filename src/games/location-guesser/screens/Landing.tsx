import './landing.css';
import React from 'react';
import {makeRandomSeed} from '../../../utils/rng';
import {DEFAULT_SCORING_RADIUS} from '../../../utils/scoring';

const ROUND_COUNT = 5;

interface LandingProps {
    onStart: (seed: string, isDaily: boolean, dailyDate: string, roundCount?: number, minRadius?: number) => void;
    onExit?: () => void;
}

function Landing({onStart}: LandingProps) {
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
            <button
                className="landing__start-btn"
                onClick={() => onStart(customSeed || defaultSeed, false, '', rounds, minRadius)}
            >
                Start Game
            </button>
        </div>
    );
}

export default Landing;
