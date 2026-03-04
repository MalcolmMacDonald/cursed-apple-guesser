//show image from assets
//show title
//show map selection element

import MapSelection from "../../components/map-selection";
import {type GameData, type GameScreenName, type LocationData, type MapLocation} from "../../types";


function GameScreen({setState, gameData, setGameData}:
                    {
                        setState: (state: GameScreenName) => void,
                        gameData: (GameData),
                        setGameData: (gameData: GameData) => void
                    }) {

    const location: LocationData = gameData.locations[gameData.currentRound];

    const handleSubmit = (guessLocation: MapLocation) => {
        setGameData({...gameData, guesses: [...gameData.guesses, guessLocation]});
        setState('intermediate_scoring');
    };

    return (
        <div className="game-screen" draggable={false}>
            <img src={`locations/${location.fileName}`} alt="Location" className="game-bg"/>
            <MapSelection onSubmit={handleSubmit}/>
        </div>
    );
}


export default GameScreen;
