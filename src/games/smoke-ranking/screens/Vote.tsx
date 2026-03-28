import React from 'react';
import {TOPBAR_HEIGHT} from '../../../components/top-bar';

const VOTE_GOAL = 25;
const VOTE_STEP = 5;
const MILESTONE_COUNT = VOTE_GOAL / VOTE_STEP; // 5

interface VoteProps {
    pair: [string, string];
    onVote: (winnerId: string, loserId: string) => void;
    onViewLeaderboard: () => void;
    onExit: () => void;
    dailyVoteCount: number;
}

function Vote({pair, onVote, onViewLeaderboard, onExit, dailyVoteCount}: VoteProps) {
    const [hovered, setHovered] = React.useState<0 | 1 | null>(null);
    const [isPortrait, setIsPortrait] = React.useState(() => window.matchMedia('(orientation: portrait)').matches);
    const availableHeight = `calc(100vh - ${TOPBAR_HEIGHT}px)`;

    React.useEffect(() => {
        const mq = window.matchMedia('(orientation: portrait)');
        const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const clampedVotes = Math.min(dailyVoteCount, VOTE_GOAL);
    const nextMilestone = Math.min(VOTE_GOAL, Math.ceil(clampedVotes / VOTE_STEP) * VOTE_STEP);
    const votesUntilNext = nextMilestone - clampedVotes;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: availableHeight,
            background: '#0d0d1a',
            userSelect: 'none',
        }}>
            <div style={{
                textAlign: 'center',
                padding: '16px 24px 12px',
                flexShrink: 0,
            }}>
                <p style={{
                    margin: 0,
                    color: '#e2e8f0',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                }}>
                    Which spot would you rather <span style={{color: '#06b627'}}>smoke at</span>?
                </p>
                <p style={{margin: '4px 0 0', color: '#64748b', fontSize: '0.8rem'}}>Click to vote</p>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: isPortrait ? 'column' : 'row',
                flex: 1,
                gap: 4,
                padding: '0 4px 4px',
                overflow: isPortrait ? 'auto' : 'hidden',
            }}>
                {pair.map((fileName, idx) => (
                    <button
                        key={fileName}
                        onClick={() => onVote(fileName, pair[idx === 0 ? 1 : 0])}
                        onMouseEnter={() => setHovered(idx as 0 | 1)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            flex: 1,
                            minHeight: isPortrait ? 0 : undefined,
                            border: hovered === idx
                                ? '3px solid #a78bfa'
                                : '3px solid transparent',
                            borderRadius: 12,
                            padding: 0,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            background: 'none',
                            position: 'relative',
                            transition: 'border-color 0.15s, transform 0.1s',
                            transform: hovered === idx ? 'scale(1.01)' : 'scale(1)',
                        }}
                    >
                        <img
                            src={`/locations/${fileName}`}
                            alt={`Option ${idx + 1}`}
                            draggable={false}
                            style={{
                                width: '100%',
                                height: isPortrait ? 'auto' : '100%',
                                objectFit: isPortrait ? 'contain' : 'cover',
                                display: 'block',
                                filter: hovered === idx ? 'brightness(1.1)' : 'brightness(0.85)',
                                transition: 'filter 0.15s',
                            }}
                        />
                        {hovered === idx && (
                            <div style={{
                                position: 'absolute',
                                bottom: 16,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(167, 139, 250, 0.9)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                padding: '8px 20px',
                                borderRadius: 20,
                                pointerEvents: 'none',
                                whiteSpace: 'nowrap',
                            }}>
                                Vote for this spot
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                flexShrink: 0,
            }}>
                {/* Vote progress */}
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%', maxWidth: 260}}>
                    <div style={{display: 'flex', gap: 6}}>
                        {Array.from({length: MILESTONE_COUNT}, (_, i) => {
                            const filled = clampedVotes >= (i + 1) * VOTE_STEP;
                            return (
                                <div key={i} style={{
                                    width: 32,
                                    height: 8,
                                    borderRadius: 4,
                                    background: filled ? '#a78bfa' : 'rgba(255,255,255,0.1)',
                                    transition: 'background 0.2s',
                                }}/>
                            );
                        })}
                    </div>
                    <p style={{margin: 0, color: '#475569', fontSize: '0.72rem'}}>
                        {clampedVotes >= VOTE_GOAL
                            ? 'All leaderboard spots unlocked today!'
                            : `${clampedVotes}/${VOTE_GOAL} votes today · ${votesUntilNext} more to unlock next spot`}
                    </p>
                </div>

                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12}}>
                    <button
                        onClick={onViewLeaderboard}
                        style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.4)',
                            borderRadius: 8,
                            color: '#a5b4fc',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '6px 16px',
                        }}
                    >
                        View Leaderboard
                    </button>
                    <button
                        onClick={onExit}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#475569',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            padding: '4px 12px',
                        }}
                    >
                        Back to Hub
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Vote;
