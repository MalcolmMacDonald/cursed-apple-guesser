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
    return (
        <div className="game-screen" draggable={false}>
            <img src={`locations/${location.fileName}`} alt="Location" className="game-bg"/>
            <MapSelection setState={setState} gameData={gameData} setGameData={setGameData}/>
        </div>
    );
}


export default GameScreen;
