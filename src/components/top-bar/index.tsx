import React from "react";

export const TOPBAR_HEIGHT = 52;

function TopBar({ currentGame, onHome }: {
    currentGame?: string;
    onHome: () => void;
}) {
    const [hovered, setHovered] = React.useState(false);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: TOPBAR_HEIGHT,
            zIndex: 1000,
            background: 'rgba(8, 8, 18, 0.88)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            gap: '10px',
            boxSizing: 'border-box',
        }}>
            <button
                onClick={onHome}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    background: hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: hovered ? '#fff' : 'rgba(255,255,255,0.65)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                    padding: '5px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    transition: 'color 0.15s, background 0.15s',
                    flexShrink: 0,
                }}
            >
                <span style={{ fontSize: '1rem' }}>🎮</span>
                Game Hub
            </button>

            {currentGame && (
                <>
                    <span style={{
                        color: 'rgba(255,255,255,0.2)',
                        fontSize: '1rem',
                        lineHeight: 1,
                        flexShrink: 0,
                    }}>›</span>
                    <span style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {currentGame}
                    </span>
                </>
            )}
        </div>
    );
}

export default TopBar;
