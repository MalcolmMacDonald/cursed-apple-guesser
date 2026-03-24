import React from 'react';
import type {RoundScore} from "../types.ts";

interface GameFinalProps {
    gameName: string;
    scores: RoundScore[];
    totalRounds: number;
    isDaily: boolean;
    dailyDate?: string;
    storageKey: string;
    seed?: string;
    /** Max score per round for display. Defaults to 1000. */
    maxScorePerRound?: number;
    formatShareText: (isDaily: boolean, scores: RoundScore[], totalScore: number, seed: string, date: string, url: string) => string;
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
    const totalScore = scores.reduce((a, b) => a + b.score, 0);

    React.useEffect(() => {
        if (isDaily && dailyDate) {
            localStorage.setItem(storageKey, dailyDate);
        }
    }, [isDaily, dailyDate, storageKey]);

    const handleCopyResults = () => {
        const date = dailyDate ?? new Date().toISOString().split('T')[0];
        const url = window.location.href;
        navigator.clipboard.writeText(formatShareText(isDaily, scores, totalScore, seed ??= "", date, url));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="final-score">
            <h2 className="final-score__title">Final Score</h2>
            <div className="final-score__rounds">
                {scores.map((score, i) => (
                    <div key={i} className="final-score__round-row">
                        <span className="final-score__round-label">Round {i + 1}</span>
                        <span className="final-score__round-score">{score.score}</span>
                        <span className="final-score__round-max">/ {score.maxScore}</span>
                    </div>
                ))}
            </div>
                
            {(totalScore == totalRounds) ? (
                <p className="final-score__total">PERFECT</p>) : 
                (
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        
                <p className="final-score__subtitle">Total score (lower is better)</p>
                <p className="final-score__total">{totalScore}</p>
                <p className="final-score__total-max">with a maximum of {totalRounds * maxScorePerRound} points</p>
                    </div>
                )
            }
            
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
