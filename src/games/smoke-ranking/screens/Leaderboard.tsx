import React from 'react';
import {SMOKE_RANKING_BACKEND_URL} from '../SmokeRankingFlow';
import type {SmokeScore} from '../SmokeRankingFlow';
import {TOPBAR_HEIGHT} from '../../../components/top-bar';

interface LeaderboardProps {
    onVoteAgain: () => void;
    onExit: () => void;
}

const ELO_START = 1500;
const ELO_K = 32;

function computeElo(wins: number, losses: number): number {
    // Assumes all opponents are equal (1500 ELO), so expected score per game = 0.5
    return ELO_START + (ELO_K / 2) * (wins - losses);
}

function Leaderboard({onVoteAgain, onExit}: LeaderboardProps) {
    const [entries, setEntries] = React.useState<SmokeScore[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [fullscreenImage, setFullscreenImage] = React.useState<string | null>(null);
    const [isPortrait, setIsPortrait] = React.useState(() => window.matchMedia('(orientation: portrait)').matches);

    React.useEffect(() => {
        const mq = window.matchMedia('(orientation: portrait)');
        const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    React.useEffect(() => {
        if (!fullscreenImage) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setFullscreenImage(null);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [fullscreenImage]);

    React.useEffect(() => {
        fetch(`${SMOKE_RANKING_BACKEND_URL}/leaderboard`)
            .then(r => r.json())
            .then((data: SmokeScore[]) => {
                const sorted = [...data].sort((a, b) => computeElo(b.wins, b.losses) - computeElo(a.wins, a.losses));
                setEntries(sorted.slice(0, 20));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

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
                    Ranked by ELO rating (starting at 1500)
                </p>
            </div>

            <div style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: '8px 16px',
            }}>
                {loading ? (
                    <p style={{textAlign: 'center', color: '#475569', marginTop: 40}}>
                        Loading votes...
                    </p>
                ) : entries.length === 0 ? (
                    <p style={{textAlign: 'center', color: '#475569', marginTop: 40}}>
                        No votes recorded yet. Be the first!
                    </p>
                ) : (
                    entries.map((entry, i) => {
                        const total = entry.wins + entry.losses;
                        const elo = Math.round(computeElo(entry.wins, entry.losses));
                        // Progress bar: map ELO range [1000, 2000] to [0%, 100%]
                        const eloBarPct = Math.min(100, Math.max(0, ((elo - 1000) / 1000) * 100));
                        return (
                            <div key={entry.fileName} style={{
                                display: 'flex',
                                flexDirection: isPortrait ? 'column' : 'row',
                                alignItems: isPortrait ? 'stretch' : 'center',
                                gap: isPortrait ? 8 : 12,
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
                                {isPortrait ? (
                                    <>
                                        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                            <span style={{fontSize: '1.2rem', width: 28, textAlign: 'center', flexShrink: 0}}>
                                                {medals[i] ?? <span style={{color: '#475569', fontSize: '0.85rem'}}>#{i + 1}</span>}
                                            </span>
                                            <span style={{fontSize: '1rem', fontWeight: 700, color: '#a78bfa'}}>{elo}</span>
                                            <span style={{fontSize: '0.75rem', color: '#64748b'}}>ELO</span>
                                            <span style={{fontSize: '0.72rem', color: '#475569', marginLeft: 'auto'}}>
                                                {entry.wins}W / {entry.losses}L · {total} vote{total !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <img
                                            src={`/locations/${entry.fileName}`}
                                            alt={entry.fileName}
                                            draggable={false}
                                            onClick={() => setFullscreenImage(entry.fileName)}
                                            style={{
                                                width: '100%',
                                                maxWidth: '100%',
                                                height: 'auto',
                                                display: 'block',
                                                borderRadius: 6,
                                                cursor: 'pointer',
                                            }}
                                        />
                                        <div style={{
                                            background: 'rgba(255,255,255,0.07)',
                                            borderRadius: 4,
                                            height: 6,
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                width: `${eloBarPct}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                                                borderRadius: 4,
                                                transition: 'width 0.3s ease',
                                            }}/>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span style={{fontSize: '1.2rem', width: 28, textAlign: 'center', flexShrink: 0}}>
                                            {medals[i] ?? <span style={{color: '#475569', fontSize: '0.85rem'}}>#{i + 1}</span>}
                                        </span>
                                        <img
                                            src={`/locations/${entry.fileName}`}
                                            alt={entry.fileName}
                                            draggable={false}
                                            onClick={() => setFullscreenImage(entry.fileName)}
                                            style={{
                                                width: 80,
                                                height: 50,
                                                objectFit: 'cover',
                                                borderRadius: 6,
                                                flexShrink: 0,
                                                cursor: 'pointer',
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
                                                }}>{elo}</span>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    color: '#64748b',
                                                }}>ELO</span>
                                            </div>
                                            <div style={{
                                                background: 'rgba(255,255,255,0.07)',
                                                borderRadius: 4,
                                                height: 6,
                                                overflow: 'hidden',
                                            }}>
                                                <div style={{
                                                    width: `${eloBarPct}%`,
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
                                    </>
                                )}
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

            {fullscreenImage && (
                <div
                    onClick={() => setFullscreenImage(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        cursor: 'zoom-out',
                    }}
                >
                    <img
                        src={`/locations/${fullscreenImage}`}
                        alt={fullscreenImage}
                        draggable={false}
                        style={{
                            maxWidth: '95vw',
                            maxHeight: '95vh',
                            objectFit: 'contain',
                            borderRadius: 8,
                            boxShadow: '0 0 60px rgba(0,0,0,0.8)',
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default Leaderboard;
