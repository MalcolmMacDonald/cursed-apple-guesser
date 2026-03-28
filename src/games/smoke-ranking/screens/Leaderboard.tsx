import React from 'react';
import {getSmokeScores} from '../SmokeRankingFlow';
import {TOPBAR_HEIGHT} from '../../../components/top-bar';

interface LeaderboardProps {
    onVoteAgain: () => void;
    onExit: () => void;
}

function winRate(wins: number, losses: number): number {
    const total = wins + losses;
    if (total === 0) return 0;
    return wins / total;
}

function Leaderboard({onVoteAgain, onExit}: LeaderboardProps) {
    const scores = getSmokeScores();
    const entries = Object.values(scores)
        .filter(e => e.wins + e.losses >= 1)
        .sort((a, b) => {
            const rateB = winRate(b.wins, b.losses);
            const rateA = winRate(a.wins, a.losses);
            if (rateB !== rateA) return rateB - rateA;
            return (b.wins + b.losses) - (a.wins + a.losses);
        });

    const availableHeight = `calc(100vh - ${TOPBAR_HEIGHT}px)`;
    const medals = ['🥇', '🥈', '🥉'];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: availableHeight,
            background: '#0d0d1a',
            color: '#e2e8f0',
            overflow: 'hidden',
        }}>
            <div style={{
                textAlign: 'center',
                padding: '20px 24px 12px',
                flexShrink: 0,
            }}>
                <p style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#e2e8f0',
                }}>
                    Top Smoke Spots
                </p>
                <p style={{margin: '4px 0 0', color: '#64748b', fontSize: '0.8rem'}}>
                    Ranked by community votes
                </p>
            </div>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px 16px',
            }}>
                {entries.length === 0 ? (
                    <p style={{textAlign: 'center', color: '#475569', marginTop: 40}}>
                        No votes recorded yet. Be the first!
                    </p>
                ) : (
                    entries.slice(0, 20).map((entry, i) => {
                        const total = entry.wins + entry.losses;
                        const rate = Math.round(winRate(entry.wins, entry.losses) * 100);
                        return (
                            <div key={entry.fileName} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '8px 12px',
                                borderRadius: 10,
                                marginBottom: 8,
                                background: i < 3
                                    ? 'rgba(167,139,250,0.08)'
                                    : 'rgba(255,255,255,0.03)',
                                border: i < 3
                                    ? '1px solid rgba(167,139,250,0.2)'
                                    : '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <span style={{fontSize: '1.2rem', width: 28, textAlign: 'center', flexShrink: 0}}>
                                    {medals[i] ?? <span style={{color: '#475569', fontSize: '0.85rem'}}>#{i + 1}</span>}
                                </span>
                                <img
                                    src={`/locations/${entry.fileName}`}
                                    alt={entry.fileName}
                                    draggable={false}
                                    style={{
                                        width: 80,
                                        height: 50,
                                        objectFit: 'cover',
                                        borderRadius: 6,
                                        flexShrink: 0,
                                    }}
                                />
                                <div style={{flex: 1, minWidth: 0}}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginBottom: 4,
                                    }}>
                                        <span style={{
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            color: '#a78bfa',
                                        }}>{rate}%</span>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: '#64748b',
                                        }}>win rate</span>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.07)',
                                        borderRadius: 4,
                                        height: 6,
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            width: `${rate}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                                            borderRadius: 4,
                                            transition: 'width 0.3s ease',
                                        }}/>
                                    </div>
                                    <p style={{
                                        margin: '4px 0 0',
                                        fontSize: '0.72rem',
                                        color: '#475569',
                                    }}>
                                        {entry.wins}W / {entry.losses}L &nbsp;·&nbsp; {total} vote{total !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div style={{
                display: 'flex',
                gap: 8,
                padding: '12px 16px',
                flexShrink: 0,
                borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
                <button
                    onClick={onVoteAgain}
                    style={{
                        flex: 1,
                        padding: '12px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        borderRadius: 10,
                        color: '#a5b4fc',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    Vote Again
                </button>
                <button
                    onClick={onExit}
                    style={{
                        padding: '12px 20px',
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        color: '#475569',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                    }}
                >
                    Hub
                </button>
            </div>
        </div>
    );
}

export default Leaderboard;
