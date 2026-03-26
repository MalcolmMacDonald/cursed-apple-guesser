import './daily-histogram.css';

export interface HistogramData {
    date: string;
    totalCount: number;
    scores: { score: number; count: number }[];
}

interface DailyHistogramProps {
    histogram: HistogramData;
    playerScore: number;
    totalRounds: number;
    title?: string;
    large?: boolean;
}

function DailyHistogram({histogram, playerScore, totalRounds, title, large}: DailyHistogramProps) {
    const countByScore = Object.fromEntries(histogram.scores.map(s => [s.score, s.count]));
    const allScores = Array.from({length: totalRounds * 3 - totalRounds + 1}, (_, i) => i + totalRounds);
    const maxCount = Math.max(...allScores.map(s => countByScore[s] ?? 0), 1);
    const maxBarHeight = large ? 80 : 60;
    const perfectScore = totalRounds;
    const perfectCount = countByScore[perfectScore] ?? 0;

    const displayTitle = title ?? `Today — ${histogram.totalCount} ${histogram.totalCount === 1 ? 'player' : 'players'}`;

    return (
        <div className={`daily-histogram${large ? ' daily-histogram--large' : ''}`}>
            <p className="daily-histogram__title">{displayTitle}</p>
            <div className="daily-histogram__bars">
                {allScores.map(score => {
                    const count = countByScore[score] ?? 0;
                    const isPlayer = score === playerScore;
                    const isPerfect = score === perfectScore;
                    const barHeight = Math.max(4, Math.round((count / maxCount) * maxBarHeight));
                    return (
                        <div key={score} className="daily-histogram__bar-col">
                            {isPerfect && (
                                <span className="daily-histogram__perfect-count">
                                    {perfectCount > 0 ? perfectCount : ''}
                                </span>
                            )}
                            <div
                                className={`daily-histogram__bar${isPlayer ? ' daily-histogram__bar--player' : ''}`}
                                style={{height: barHeight}}
                                title={`${count} player${count !== 1 ? 's' : ''}`}
                            />
                            <span className={`daily-histogram__label${isPlayer ? ' daily-histogram__label--player' : ''}`}>
                                {score}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default DailyHistogram;
