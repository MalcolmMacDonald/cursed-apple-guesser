//show image from assets
//show title
//show map selection element

import MapSelection from "../../components/map-selection";
import {type GameData, type GameScreenName, type LocationData} from "../../types";


function GameScreen({setState, gameData, setGameData}:
                    {
                        setState: (state: GameScreenName) => void,
                        gameData: (GameData),
                        setGameData: (gameData: GameData) => void
                    }) {

    const location: LocationData = gameData.locations[gameData.currentRound];
    //full background image, no scrolling
    return (
        <div className="game-screen" draggable={false}>
            <img src={`locations/${location.fileName}`} alt="Location" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: -1,
                userSelect: 'none',
                pointerEvents: 'none'
            }}/>
            <h1 style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                textShadow: '2px 2px 4px #000000',
                userSelect: 'none'

            }}>Cursed Apple Guesser</h1>
            <MapSelection setState={setState} gameData={gameData} setGameData={setGameData}/>
        </div>
    );
}


export default GameScreen;