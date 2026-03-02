import type {GameData, GameScreenName} from "../../types.ts";

export function FinalScoreScreen({setState, gameData}:
                                 {
                                     setState: (state: GameScreenName) => void,
                                     gameData: GameData
                                 }) {

    const totalScore = gameData.scores.reduce((a, b) => a + b, 0);

    return (
        <div className="final-score">
            <h1>Final Score</h1>
            <p className="final-score__subtitle">Your total score is:</p>
            <p className="final-score__total">{totalScore} out of a possible {gameData.totalRounds * 1000}</p>
            <button className="final-score__play-again" onClick={() => setState('landing')}>
                Play Again
            </button>
        </div>
    );
}
