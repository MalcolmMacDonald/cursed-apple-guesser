//landing screen for Geoguessr style game


import {type GameState} from "../../types.ts";

function LandingScreen({setState}: { setState: (state: GameState) => void }) {

    //when start game is pressed, go to game screen
    return (
        <div>
            <h1>Cursed Apple Guesser</h1>

            <button onClick={() => {
                setState('game');
            }}
            >Start Game
            </button>
        </div>);

}

export default LandingScreen

