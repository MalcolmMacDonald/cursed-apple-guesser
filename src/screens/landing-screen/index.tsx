//landing screen for Geoguessr style game

import {type GameData, type GameScreenName} from "../../types.ts";
import locations from "../../../public/locations/metadata.json";

import seedRandom from 'seedrandom';

const rountCount = 5;
const MIRROR_CREDIT = 1.0; // Score multiplier when guess matches mirrored location (0–1)
const seed = (seedRandom()() * 1000).toFixed(0);
const random = seedRandom(seed);

function LandingScreen({setState, setGameData, onExit}: {
                           setState: (state: GameScreenName) => void,
                           setGameData: (gameData: GameData) => void,
                           onExit?: () => void,
                       }
) {
    const startLocations = locations.sort(() => 0.5 - random()).slice(0, rountCount);

    return (
        <div className="landing">
            <div className="landing__icon">🗺️</div>

            <div className="landing__text">
                <h1 className="landing__title">Cursed Apple Guesser</h1>
                <p className="landing__subtitle">5 rounds — guess the location on the map</p>
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
                        mirrorMultiplier: MIRROR_CREDIT
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
