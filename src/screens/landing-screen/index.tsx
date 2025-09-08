//landing screen for Geoguessr style game


import {type GameData, type GameScreenName} from "../../types.ts";
import locations from "../../../public/locations/metadata.json";

import seedRandom from 'seedrandom';

const rountCount = 3;
const seed = (seedRandom()() * 1000).toFixed(0);
const random = seedRandom(seed);

function LandingScreen({setState, setGameData}: {
                           setState: (state: GameScreenName) => void,
                           setGameData: (gameData: GameData) => void
                       }
) {

    const startLocations = locations.sort(() => 0.5 - random()).slice(0, rountCount);


    //when start game is pressed, go to game screen
    return (
        <div>
            <h1 style={{
                width: '100%',
                color: 'white',
                textShadow: '2px 2px 4px #000000',
                userSelect: 'none',
            }}>Cursed Apple Guesser</h1>
            

            <button onClick={() => {
                setGameData({
                    locations: startLocations,
                    currentRound: 0,
                    totalRounds: rountCount,
                    scores: [],
                    guesses: [],
                    seed: seed
                })
                setState('game');
            }}
            >Start Game
            </button>
        </div>);

}

export default LandingScreen

