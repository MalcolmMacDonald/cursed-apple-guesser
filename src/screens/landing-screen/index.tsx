//landing screen for Geoguessr style game

// @ts-ignore
import React from "react";
import {type GameData, type GameScreenName} from "../../types.ts";
import locations from "../../../public/locations/metadata.json";

import seedRandom from 'seedrandom';

const rountCount = 5;
const seed = (seedRandom()() * 1000).toFixed(0);
const random = seedRandom(seed);

function LandingScreen({setState, setGameData, onExit}: {
                           setState: (state: GameScreenName) => void,
                           setGameData: (gameData: GameData) => void,
                           onExit?: () => void,
                       }
) {
    const [mirrorMultiplier, setMirrorMultiplier] = React.useState(1.0);

    const startLocations = locations.sort(() => 0.5 - random()).slice(0, rountCount);

    return (
        <div className="landing">
            <div className="landing__icon">🗺️</div>

            <div className="landing__text">
                <h1 className="landing__title">Cursed Apple Guesser</h1>
                <p className="landing__subtitle">5 rounds — guess the location on the map</p>
            </div>

            <div className="landing__settings">
                <label className="landing__setting-label">
                    Mirror credit: <span className="landing__setting-value">{Math.round(mirrorMultiplier * 100)}%</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={mirrorMultiplier}
                    onChange={e => setMirrorMultiplier(parseFloat(e.target.value))}
                    className="landing__slider"
                />
                <p className="landing__setting-hint">Score multiplier when your guess matches the mirrored location</p>
            </div>

            <button
                className="landing__start-btn"
                onClick={() => {
                    setGameData({
                        locations: startLocations,
                        currentRound: 0,
                        totalRounds: rountCount,
                        scores: [],
                        guesses: [],
                        seed: seed,
                        mirrorMultiplier
                    });
                    setState('game');
                }}
            >
                Start Game
            </button>
        </div>
    );
}

export default LandingScreen;
