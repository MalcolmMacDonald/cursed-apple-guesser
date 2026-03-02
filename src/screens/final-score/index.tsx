import type {GameData, GameScreenName} from "../../types.ts";

export function FinalScoreScreen({setState, gameData}:
                                 {
                                     setState: (state: GameScreenName) => void,
                                     gameData: GameData
                                 }) {

    const totalScore = gameData.scores.reduce((a, b) => a + b, 0);

    return (
        <div className="final-score">
            <h2 className="final-score__title">Final Score</h2>
            <p className="final-score__subtitle">Your total score is:</p>
            <p className="final-score__total">{totalScore}</p>
            <p className="final-score__total-max">out of a possible {gameData.totalRounds * 1000}</p>
            <button className="final-score__play-again" onClick={() => setState('landing')}>
                Play Again
            </button>
        </div>
    );
}
