import './final.css';
import React from 'react';
import type {LGGameState} from '../LocationGuesserFlow';
import {LG_DAILY_KEY} from '../LocationGuesserFlow';
import {getGolfScoreEmoji} from '../../../utils/scoring';
import type {RoundScore} from '../../../types';

interface FinalProps {
    state: LGGameState;
    onPlayAgain: () => void;
    onExit?: () => void;
}

function Final({state, onPlayAgain, onExit}: FinalProps) {
    const [copied, setCopied] = React.useState(false);
    const {scores, totalRounds, isDaily, dailyDate, seed} = state;
    const totalScore = scores.reduce((a: number, b: RoundScore) => a + b.score, 0);

    React.useEffect(() => {
        if (isDaily && dailyDate) {
            localStorage.setItem(LG_DAILY_KEY, dailyDate);
        }
    }, [isDaily, dailyDate]);

    const handleCopyResults = () => {
        const date = dailyDate ?? new Date().toISOString().split('T')[0];
        const url = window.location.href;
        const text = [
            isDaily ? `Deadlock Location Guesser Daily - ${date}` : `Deadlock Location Guesser`,
            scores.map((s: RoundScore) => getGolfScoreEmoji(s.score)).join(' '),
            totalScore === scores.length ? `Perfect score!` : `${totalScore}/${scores.length * 3} (lower is better)`,
            !isDaily ? `Seed: ${seed}` : '',
            url,
        ].filter(line => line.length > 0).join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="final-score">
            <h2 className="final-score__title">Final Score</h2>
            <div className="final-score__rounds">
                {scores.map((score: RoundScore, i: number) => (
                    <div key={i} className="final-score__round-row">
                        <span className="final-score__round-label">Round {i + 1}</span>
                        <span className="final-score__round-score">{score.score}</span>
                        <span className="final-score__round-max">/ {score.maxScore}</span>
                    </div>
                ))}
            </div>
            {totalScore === totalRounds ? (
                <p className="final-score__total">PERFECT</p>
            ) : (
                <div className="final-score__total-wrapper">
                    <p className="final-score__subtitle">Total score (lower is better)</p>
                    <p className="final-score__total">{totalScore}</p>
                    <p className="final-score__total-max">with a maximum of {totalRounds * 3} points</p>
                </div>
            )}
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

export default Final;
