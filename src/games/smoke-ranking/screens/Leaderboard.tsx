import React from 'react';
import {SMOKE_ELO_BACKEND_URL} from '../SmokeRankingFlow';
import type {SmokeScore} from '../SmokeRankingFlow';
import {TOPBAR_HEIGHT} from '../../../components/top-bar';

interface LeaderboardProps {
    onVoteAgain: () => void;
    onExit: () => void;
    dailyVoteCount: number;
}

// unlockedCount: 0–5 based on dailyVoteCount / 3
// topFive[i] is unlocked when i >= (5 - unlockedCount)  → rank 5 first, rank 1 last
// bottomFive[i] is unlocked when i < unlockedCount       → 5th lowest first, 1st lowest last
function getUnlockedCount(dailyVoteCount: number): number {
    return Math.min(5, Math.floor(dailyVoteCount / 3));
}

function Leaderboard({onVoteAgain, onExit, dailyVoteCount}: LeaderboardProps) {
    const [topFive, setTopFive] = React.useState<SmokeScore[]>([]);
    const [bottomFive, setBottomFive] = React.useState<SmokeScore[]>([]);
    const [sixthTop, setSixthTop] = React.useState<SmokeScore | null>(null);
    const [sixthBottom, setSixthBottom] = React.useState<SmokeScore | null>(null);
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
        fetch(`${SMOKE_ELO_BACKEND_URL}/leaderboard`)
            .then(r => r.json())
            .then((data: SmokeScore[]) => {
                // Backend returns data pre-sorted by Elo descending
                const sorted = [...data];
                setTopFive(sorted.slice(0, 5));
                setSixthTop(sorted[5] ?? null);
                // bottomFive: index 0 = 5th lowest (least bad of worst), index 4 = 1st lowest (worst)
                setBottomFive(sorted.slice(-5));
                const sixthFromBottom = sorted.length >= 6 ? sorted[sorted.length - 6] : null;
                // avoid duplicate if list is short enough that 6th top === 6th bottom
                setSixthBottom(sixthFromBottom && sixthFromBottom !== sorted[5] ? sixthFromBottom : null);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const availableHeight = `calc(100vh - ${TOPBAR_HEIGHT}px)`;
    const medals = ['🥇', '🥈', '🥉'];
    const unlockedCount = getUnlockedCount(dailyVoteCount);

    function renderEntry(entry: SmokeScore, rank: React.ReactNode, isLocked: boolean, highlight: boolean) {
        const totalVotes = entry.wins + entry.losses;
        return (
            <div key={entry.fileName} style={{
                display: 'flex',
                flexDirection: isPortrait ? 'column' : 'row',
                alignItems: isPortrait ? 'stretch' : 'center',
                gap: isPortrait ? 6 : 10,
                padding: '6px 10px',
                borderRadius: 10,
                marginBottom: 8,
                background: highlight
                    ? 'rgba(167,139,250,0.08)'
                    : 'rgba(255,255,255,0.03)',
                border: highlight
                    ? '1px solid rgba(167,139,250,0.2)'
                    : '1px solid rgba(255,255,255,0.06)',
                opacity: isLocked ? 0.5 : 1,
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0}}>
                    <span style={{fontSize: '1.2rem', width: 28, textAlign: 'center'}}>
                        {rank}
                    </span>
                    {isLocked && (
                        <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>
                            {isPortrait ? '🔒 Vote more to unlock' : 'Vote more to unlock'}
                        </span>
                    )}
                </div>
                {isLocked ? (
                    <div style={{
                        flex: isPortrait ? undefined : 1,
                        width: isPortrait ? '100%' : undefined,
                        height: isPortrait ? 80 : 70,
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#334155',
                        fontSize: '1.5rem',
                    }}>
                        🔒
                    </div>
                ) : (
                    <div style={{
                        flex: isPortrait ? undefined : 1,
                        minWidth: isPortrait ? undefined : 0,
                        position: 'relative',
                        display: 'block',
                        borderRadius: 6,
                        overflow: 'hidden',
                        cursor: 'pointer',
                    }} onClick={() => setFullscreenImage(entry.fileName)}>
                        <img
                            src={`/locations/${entry.fileName}`}
                            alt={entry.fileName}
                            draggable={false}
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                objectFit: 'contain',
                                borderRadius: 6,
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: 4,
                            right: 4,
                            background: 'rgba(0,0,0,0.65)',
                            borderRadius: 4,
                            padding: '2px 6px',
                            display: 'flex',
                            gap: 6,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            lineHeight: 1.4,
                            backdropFilter: 'blur(2px)',
                        }}>
                            <span style={{color: '#4ade80'}}>{entry.wins}W</span>
                            <span style={{color: '#f87171'}}>{entry.losses}L</span>
                            <span style={{color: '#94a3b8'}}>{totalVotes}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: availableHeight,
            background: '#0d0d1a',
            color: '#e2e8f0',
            overflow: 'hidden',
        }}>
            <div style={{textAlign: 'center', padding: '20px 24px 12px', flexShrink: 0}}>
                <p style={{margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0'}}>
                    Top Smoke Spots
                </p>
                <p style={{margin: '4px 0 0', color: '#64748b', fontSize: '0.8rem'}}>
                    {unlockedCount < 5
                        ? `Vote to unlock · ${unlockedCount * 2 + 2} of 12 spots revealed`
                        : 'All spots revealed · Ranked by ELO rating'}
                </p>
            </div>

            <div style={{flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px'}}>
                {loading ? (
                    <p style={{textAlign: 'center', color: '#475569', marginTop: 40}}>Loading votes...</p>
                ) : topFive.length === 0 ? (
                    <p style={{textAlign: 'center', color: '#475569', marginTop: 40}}>
                        No votes recorded yet. Be the first!
                    </p>
                ) : (
                    <div style={{display: 'flex', gap: 12, alignItems: 'flex-start'}}>
                        {/* Best spots column */}
                        <div style={{flex: 1, minWidth: 0}}>
                            <p style={{
                                margin: '0 0 8px',
                                color: '#64748b',
                                fontSize: '0.72rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em'
                            }}>
                                Best spots
                            </p>
                            {topFive.map((entry, i) => {
                                const isLocked = i < (5 - unlockedCount);
                                const rankLabel = medals[i] ??
                                    <span style={{color: '#475569', fontSize: '0.85rem'}}>#{i + 1}</span>;
                                return renderEntry(entry, rankLabel, isLocked, i < 3 && !isLocked);
                            })}
                            {sixthTop && renderEntry(
                                sixthTop,
                                <span style={{color: '#475569', fontSize: '0.85rem'}}>#6</span>,
                                false,
                                false,
                            )}
                        </div>

                        {/* Vertical divider */}
                        <div style={{
                            width: 1,
                            alignSelf: 'stretch',
                            background: 'rgba(255,255,255,0.06)',
                            flexShrink: 0,
                        }}/>

                        {/* Worst spots column */}
                        <div style={{flex: 1, minWidth: 0}}>
                            <p style={{
                                margin: '0 0 8px',
                                color: '#64748b',
                                fontSize: '0.72rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em'
                            }}>
                                Worst spots
                            </p>

                            {bottomFive.map((entry, i) => {
                                const isLocked = i >= unlockedCount;
                                // i=0 → 5th worst (5th lowest), i=4 → worst (1st lowest)
                                const rankLabel = <span style={{color: '#475569', fontSize: '0.85rem'}}>↓{i}</span>;
                                return renderEntry(entry, rankLabel, isLocked, false);
                            })}
                            {sixthBottom && renderEntry(
                                sixthBottom,
                                <span style={{color: '#475569', fontSize: '0.85rem'}}>↓6</span>,
                                false,
                                false,
                            )}
                        </div>
                    </div>
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
