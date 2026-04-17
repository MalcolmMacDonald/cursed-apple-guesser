import './final.css';
import React from 'react';
import type {LGGameState} from '../LocationGuesserFlow';
import {LG_DAILY_KEY, LG_DAILY_SCORE_KEY} from '../LocationGuesserFlow';
import {getGolfScoreEmoji} from '../../../utils/scoring';
import {makeDailyDate, makeLocalDate} from '../../../utils/rng';
import type {RoundScore} from '../../../types';
import DailyHistogram from '../../../components/daily-histogram';
import type {HistogramData} from '../../../components/daily-histogram';

import {LG_API_URL as API_URL} from '../../../config';

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
            localStorage.setItem(LG_DAILY_KEY, makeDailyDate());
            localStorage.setItem(LG_DAILY_SCORE_KEY, String(totalScore));
        }
    }, [isDaily, dailyDate, totalScore]);

    React.useEffect(() => {
        if (!isDaily || !dailyDate) return;
        const date = dailyDate.replace('-daily', '');
        const submittedKey = `dailyScore_submitted_${date}`;
        const submitAndFetch = async () => {
            try {
                if (!localStorage.getItem(submittedKey) && !(import.meta.env.DEV)) {
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
        const date = dailyDate ?? makeLocalDate();
        const url = window.location.origin;
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
            {isDaily && histogram && (
                <DailyHistogram
                    histogram={histogram}
                    playerScore={totalScore}
                    totalRounds={totalRounds}
                    title={`Today's scores — ${histogram.totalCount} ${histogram.totalCount === 1 ? 'player' : 'players'}`}
                    large
                />
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
