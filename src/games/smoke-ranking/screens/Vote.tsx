import React from 'react';
import {TOPBAR_HEIGHT} from '../../../components/top-bar';

interface VoteProps {
    pair: [string, string];
    onVote: (winnerId: string, loserId: string) => void;
    onExit: () => void;
}

function Vote({pair, onVote, onExit}: VoteProps) {
    const [hovered, setHovered] = React.useState<0 | 1 | null>(null);
    const availableHeight = `calc(100vh - ${TOPBAR_HEIGHT}px)`;

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
                flex: 1,
                gap: 4,
                padding: '0 4px 4px',
                overflow: 'hidden',
            }}>
                {pair.map((fileName, idx) => (
                    <button
                        key={fileName}
                        onClick={() => onVote(fileName, pair[idx === 0 ? 1 : 0])}
                        onMouseEnter={() => setHovered(idx as 0 | 1)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            flex: 1,
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
                                height: '100%',
                                objectFit: 'cover',
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
                textAlign: 'center',
                padding: '8px',
                flexShrink: 0,
            }}>
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
    );
}

export default Vote;
