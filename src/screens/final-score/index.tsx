import React from "react";
import type {GameData, GameScreenName} from "../../types.ts";

export function FinalScoreScreen({setState, gameData}:
                                 {
                                     setState: (state: GameScreenName) => void,
                                     gameData: GameData
                                 }) {

    const [copied, setCopied] = React.useState(false);
    const totalScore = gameData.scores.reduce((a, b) => a + b, 0);

    const handleCopyResults = () => {
        const date = gameData.dailyDate ?? new Date().toISOString().split('T')[0];
        const lines = [
            `Deadlock Map Trainer — Daily Challenge ${date}`,
            ...gameData.scores.map((s, i) => `Round ${i + 1}: ${s} / 1000`),
            `Total: ${totalScore} / ${gameData.totalRounds * 1000}`,
        ];
        navigator.clipboard.writeText(lines.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="final-score">
            <h2 className="final-score__title">Final Score</h2>
            <p className="final-score__subtitle">Your total score is:</p>
            <p className="final-score__total">{totalScore}</p>
            <p className="final-score__total-max">out of a possible {gameData.totalRounds * 1000}</p>
            {gameData.isDaily && (
                <button className="final-score__copy-btn" onClick={handleCopyResults}>
                    {copied ? 'Copied!' : 'Copy Results'}
                </button>
            )}
            <button className="final-score__play-again" onClick={() => setState('landing')}>
                Play Again
            </button>
        </div>
    );
}
