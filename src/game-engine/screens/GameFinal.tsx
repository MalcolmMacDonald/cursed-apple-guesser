import React from 'react';

interface GameFinalProps {
    gameName: string;
    scores: number[];
    totalRounds: number;
    isDaily: boolean;
    dailyDate?: string;
    storageKey: string;
    seed?: string;
    /** Max score per round for display. Defaults to 1000. */
    maxScorePerRound?: number;
    formatShareText: (scores: number[], totalScore: number, date: string, url: string) => string;
    onPlayAgain: () => void;
    onExit?: () => void;
}

function GameFinal({
                       gameName: _gameName,
                       scores,
                       totalRounds,
                       isDaily,
                       dailyDate,
                       storageKey,
                       seed,
                       maxScorePerRound = 1000,
                       formatShareText,
                       onPlayAgain,
                       onExit,
                   }: GameFinalProps) {
    const [copied, setCopied] = React.useState(false);
    const totalScore = scores.reduce((a, b) => a + b, 0);

    React.useEffect(() => {
        if (isDaily && dailyDate) {
            localStorage.setItem(storageKey, dailyDate);
        }
    }, [isDaily, dailyDate, storageKey]);

    const handleCopyResults = () => {
        const date = dailyDate ?? new Date().toLocaleString("%D-%B-%Y");
        const url = window.location.href;
        navigator.clipboard.writeText(formatShareText(scores, totalScore, date, url));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="final-score">
            <h2 className="final-score__title">Final Score</h2>
            <p className="final-score__subtitle">Your total score is:</p>
            <p className="final-score__total">{totalScore}</p>
            <p className="final-score__total-max">out of a possible {totalRounds * maxScorePerRound}</p>
            {!isDaily && seed && (
                <p className="final-score__seed">Seed: <code>{seed}</code></p>
            )}
            <button className="final-score__copy-btn" onClick={handleCopyResults}>
                {copied ? 'Copied!' : 'Copy Score'}
            </button>
            {onExit && (
                <button className="final-score__menu-btn" onClick={onExit}>
                    Return to Menu
                </button>
            )}
            <button className="final-score__play-again" onClick={onPlayAgain}>
                Play Again
            </button>
        </div>
    );
}

export default GameFinal;
