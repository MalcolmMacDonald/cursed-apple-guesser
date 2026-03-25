import './final.css';
import React from 'react';
import type {LGGameState} from '../LocationGuesserFlow';
import {LG_DAILY_KEY} from '../LocationGuesserFlow';
import {getGolfScoreEmoji} from '../../../utils/scoring';
import type {RoundScore} from '../../../types';

const API_URL = 'https://malloc--b83909f4289a11f1b97142dde27851f2.web.val.run';

interface HistogramData {
    date: string;
    totalCount: number;
    scores: {score: number; count: number}[];
}

interface FinalProps {
    state: LGGameState;
    onPlayAgain: () => void;
    onExit?: () => void;
}

function Final({state, onPlayAgain, onExit}: FinalProps) {
    const [copied, setCopied] = React.useState(false);
    const [histogram, setHistogram] = React.useState<HistogramData | null>(null);
    const {scores, totalRounds, isDaily, dailyDate, seed} = state;
    const totalScore = scores.reduce((a: number, b: RoundScore) => a + b.score, 0);

    React.useEffect(() => {
        if (isDaily && dailyDate) {
            localStorage.setItem(LG_DAILY_KEY, dailyDate);
        }
    }, [isDaily, dailyDate]);

    React.useEffect(() => {
        if (!isDaily || !dailyDate) return;
        const date = dailyDate.replace('-daily', '');
        const submittedKey = `dailyScore_submitted_${date}`;
        const submitAndFetch = async () => {
            try {
                if (!localStorage.getItem(submittedKey)) {
                    localStorage.setItem(submittedKey, '1');
                    await fetch(`${API_URL}/scores`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({score: totalScore}),
                    });
                }
                const res = await fetch(`${API_URL}/scores?date=${date}`);
                const data: HistogramData = await res.json();
                setHistogram(data);
            } catch {
                // silently fail
            }
        };
        submitAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            {isDaily && histogram && (() => {
                const countByScore = Object.fromEntries(histogram.scores.map(s => [s.score, s.count]));
                const allScores = Array.from({length: totalRounds * 3 - totalRounds + 1}, (_, i) => i + totalRounds);
                const maxCount = Math.max(...allScores.map(s => countByScore[s] ?? 0), 1);
                return (
                    <div className="final-score__histogram">
                        <p className="final-score__histogram-title">
                            Today's scores — {histogram.totalCount} {histogram.totalCount === 1 ? 'player' : 'players'}
                        </p>
                        <div className="final-score__histogram-bars">
                            {allScores.map(score => {
                                const count = countByScore[score] ?? 0;
                                const isPlayer = score === totalScore;
                                const barHeight = Math.max(4, Math.round((count / maxCount) * 80));
                                return (
                                    <div key={score} className="final-score__histogram-bar-col">
                                        <div
                                            className={`final-score__histogram-bar${isPlayer ? ' final-score__histogram-bar--player' : ''}`}
                                            style={{height: barHeight}}
                                            title={`${count} player${count !== 1 ? 's' : ''}`}
                                        />
                                        <span className={`final-score__histogram-label${isPlayer ? ' final-score__histogram-label--player' : ''}`}>
                                            {score}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}
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
