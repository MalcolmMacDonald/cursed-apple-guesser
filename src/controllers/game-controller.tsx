import type {GameScreenName} from "../types.ts";
import type {GameData} from "../types.ts";
import React from "react";
import LandingScreen from "../screens/landing-screen";
import GameScreen from "../screens/game/index.tsx";
import IntermediateScore from "../screens/intermediate-score";
import {FinalScoreScreen} from "../screens/final-score";


function GameController({ onExit }: { onExit?: () => void }) {
    const [state, setState] = React.useState<GameScreenName>('landing');
    const [gameData, setGameData] = React.useState<GameData>();
    return (
        <>
            {state === 'landing' && <LandingScreen setState={setState} setGameData={setGameData} onExit={onExit}/>}
            {state === 'game' && <GameScreen setState={setState} gameData={gameData} setGameData={setGameData}/>}
            {state === 'intermediate_scoring' &&
                <IntermediateScore setState={setState} gameData={gameData} setGameData={setGameData}/>}
            {state === 'final_scoring' && <FinalScoreScreen setState={setState} gameData={gameData}/>}
        </>
    )

}

export default GameController;