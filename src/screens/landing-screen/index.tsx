//landing screen for Geoguessr style game

import React from "react";
import {type GameData, type GameScreenName} from "../../types.ts";
import locations from "../../locations/metadata.json";

import seedRandom from 'seedrandom';

const roundCount = 5;
const MIRROR_CREDIT = .5; // Score multiplier when guess matches mirrored location (0–1)
const seed = (seedRandom()() * 1000).toFixed(0);
const random = seedRandom(seed);
const dailyDate = new Date().toISOString().split('T')[0];

function LandingScreen({setState, setGameData, onExit}: {
                           setState: (state: GameScreenName) => void,
                           setGameData: (gameData: GameData) => void,
                           onExit?: () => void,
                       }
) {
    const dailyPlayed = localStorage.getItem('dailyChallenge_completed') === dailyDate;

    const startLocations = React.useMemo(() =>
        [...locations].sort(() => 0.5 - random()).slice(0, roundCount), []);

    const dailyLocations = React.useMemo(() => {
        const dailyRandom = seedRandom(dailyDate);
        return [...locations].sort(() => 0.5 - dailyRandom()).slice(0, roundCount);
    }, []);

    const startGame = (isDaily: boolean) => {
        setGameData({
            locations: isDaily ? dailyLocations : startLocations,
            currentRound: 0,
            totalRounds: roundCount,
            scores: [],
            guesses: [],
            seed: isDaily ? dailyDate : seed,
            mirrorMultiplier: MIRROR_CREDIT,
            isDaily,
            dailyDate: isDaily ? dailyDate : undefined,
        });
        setState('game');
    };

    return (
        <div className="landing">
            <div className="landing__icon">🗺️</div>

            <div className="landing__text">
                <h1 className="landing__title">Location Guesser</h1>
                <p className="landing__subtitle">5 rounds — guess the location on the map</p>
            </div>

            <button className="landing__start-btn" onClick={() => startGame(false)}>
                Start Game
            </button>
            <button className="landing__daily-btn" onClick={() => startGame(true)} disabled={dailyPlayed}>
                {dailyPlayed ? 'Daily Completed ✓' : 'Daily Challenge'}
            </button>
        </div>
    );
}

export default LandingScreen;
