import React from 'react';

interface GameFinalProps {
    gameName: string;
    scores: number[];
    totalRounds: number;
    isDaily: boolean;
    dailyDate?: string;
    storageKey: string;
    formatShareText: (scores: number[], totalScore: number, date: string, url: string) => string;
    onPlayAgain: () => void;
}

function GameFinal({
    gameName: _gameName,
    scores,
    totalRounds,
    isDaily,
    dailyDate,
    storageKey,
    formatShareText,
    onPlayAgain,
}: GameFinalProps) {
    const [copied, setCopied] = React.useState(false);
    const totalScore = scores.reduce((a, b) => a + b, 0);

    React.useEffect(() => {
        if (isDaily && dailyDate) {
            localStorage.setItem(storageKey, dailyDate);
        }
    }, [isDaily, dailyDate, storageKey]);

    const handleCopyResults = () => {
        const date = dailyDate ?? new Date().toISOString().split('T')[0];
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
            <p className="final-score__total-max">out of a possible {totalRounds * 1000}</p>
            {isDaily && (
                <button className="final-score__copy-btn" onClick={handleCopyResults}>
                    {copied ? 'Copied!' : 'Copy Results'}
                </button>
            )}
            <button className="final-score__play-again" onClick={onPlayAgain}>
                Play Again
            </button>
        </div>
    );
}

export default GameFinal;
