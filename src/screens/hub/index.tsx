import React from 'react';
import {makeDailyDate} from '../../utils/rng';

type GameEntry = {
    id: string;
    title: string;
    description: string;
    icon: string;
    gradient: string;
    available: boolean;
    tags: string[];
    dailyStorageKey?: string;
};

const games: GameEntry[] = [
    {
        id: "location-guesser",
        title: "Location Guesser",
        description: "Drop a pin on the map to guess where a screenshot was taken. The closer you are, the higher you score.",
        icon: "🗺️",
        gradient: "linear-gradient(135deg, #1a472a 0%, #2d6a4f 50%, #40916c 100%)",
        available: true,
        tags: ["Location", "5 Rounds"],
        dailyStorageKey: 'dailyChallenge_completed',
    },
    {
        id: "navigate",
        title: "Dead Reckoning",
        description: "You're shown a start and a destination. Give step-by-step directions — forward, left, turn around — to get there.",
        icon: "🧭",
        gradient: "linear-gradient(135deg, #3d2000 0%, #7a4500 50%, #b86800 100%)",
        available: false,
        tags: ["Navigation", "5 Rounds"],
        dailyStorageKey: 'drDaily_completed',
    },
    {
        id: "nameit",
        title: "Name That Spot",
        description: "Recognise the location — but can you name it? Pick the correct spot name from four choices before time's up.",
        icon: "📍",
        gradient: "linear-gradient(135deg, #1a1a4e 0%, #2d2d8f 50%, #4a4ac4 100%)",
        available: false,
        tags: ["Multiple Choice", "Coming Soon"],
    },
    {
        id: "aboutface",
        title: "About Face",
        description: "Study the screenshot carefully, then pick which other screenshot was taken facing the exact opposite direction.",
        icon: "🔄",
        gradient: "linear-gradient(135deg, #3d001a 0%, #7a0035 50%, #b80050 100%)",
        available: false,
        tags: ["Orientation", "Coming Soon"],
    },
];

function useDailyCountdown(): string {
    const [text, setText] = React.useState('');
    React.useEffect(() => {
        const update = () => {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight.getTime() - now.getTime();
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setText(`${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);
    return text;
}

function GameCard({game, onPlay, onPlayDaily}: { game: GameEntry; onPlay: () => void; onPlayDaily?: () => void }) {
    let dailyDone = game.dailyStorageKey
        ? localStorage.getItem(game.dailyStorageKey) === makeDailyDate()
        : false;
    //if in dev mode, always set daily done to false
    if (import.meta.env.DEV) {
        dailyDone = false;
    }
    const countdown = useDailyCountdown();

    return (
        <div className={`hub-card${game.available ? '' : ' hub-card--disabled'}`}>
            <div className="hub-card__art" style={{background: game.gradient}}>
                <span className="hub-card__icon">{game.icon}</span>
            </div>
            <div className="hub-card__body">
                <p className="hub-card__title">{game.title}</p>
                <p className="hub-card__desc">{game.description}</p>
                <div className="hub-card__tags">
                    {game.tags.map(t => <span key={t} className="hub-card__tag">{t}</span>)}
                </div>
                {game.available ? (
                    <div className="hub-card__btn-group">
                        <button className="hub-card__play-btn" onClick={onPlay}>
                            Play Now
                        </button>
                        {game.dailyStorageKey && (
                            <>
                                <button
                                    className="hub-card__daily-btn"
                                    onClick={onPlayDaily}
                                    disabled={dailyDone}
                                >
                                    {dailyDone ? 'Daily Done ✓' : 'Daily Challenge'}
                                </button>
                                {dailyDone && (
                                    <p className="hub-card__daily-timer">Next in {countdown}</p>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <button className="hub-card__coming-soon-btn" disabled>
                        Coming Soon
                    </button>
                )}
            </div>
        </div>
    );
}

function HubScreen({onSelectGame}: { onSelectGame: (id: string, isDaily?: boolean) => void }) {
    const isDev = import.meta.env.DEV;

    React.useEffect(() => {
        document.title = isDev ? 'Deadlock Map Trainer (DEV)' : 'Deadlock Map Trainer';
        return () => {
            document.title = 'Deadlock Map Trainer';
        };
    }, [isDev]);

    return (
        <div className="hub-page" style={isDev ? {
            background: 'linear-gradient(160deg, #1a0d0d 0%, #221111 50%, #160a0a 100%)',
            outline: '2px solid rgba(249, 226, 175, 0.2)',
            outlineOffset: -2,
        } : undefined}>
            <div className="hub-header">
                <div className="hub-badge" style={isDev ? {
                    background: 'rgba(249, 226, 175, 0.1)',
                    border: '1px solid rgba(249, 226, 175, 0.5)',
                    color: '#f9e2af',
                } : undefined}>Game Hub{isDev ? ' — DEV' : ''}</div>
                <h1 className="hub-title" style={isDev ? {
                    background: 'linear-gradient(135deg, #ffffff 30%, #f9e2af 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                } : undefined}>Deadlock Map Trainer</h1>
                <p className="hub-subtitle">
                    Test your knowledge of the Deadlock map.
                </p>
            </div>

            <div className="hub-divider"/>

            <div className="hub-grid">
                {games.map(game => (
                    <GameCard
                        key={game.id}
                        game={game}
                        onPlay={() => onSelectGame(game.id)}
                        onPlayDaily={() => onSelectGame(game.id, true)}
                    />
                ))}
            </div>

            {import.meta.env.DEV && (
                <div style={{marginTop: 24}}>
                    <div className="hub-divider"/>
                    <div style={{display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 16px'}}>
                        <span style={{
                            background: '#f9e2af33',
                            border: '1px solid #f9e2af',
                            color: '#f9e2af',
                            borderRadius: 6,
                            padding: '2px 8px',
                            fontSize: 11,
                            fontWeight: 600,
                        }}>DEV</span>
                        <span style={{color: '#6c7086', fontSize: 13}}>Developer Tools</span>
                    </div>
                    <div className="hub-grid">
                        <div className="hub-card" onClick={() => onSelectGame('kanban')} style={{cursor: 'pointer'}}>
                            <div className="hub-card__art"
                                 style={{background: 'linear-gradient(135deg, #1e1e2e 0%, #313244 50%, #45475a 100%)'}}>
                                <span className="hub-card__icon">📋</span>
                            </div>
                            <div className="hub-card__body">
                                <p className="hub-card__title">Issue Tracker</p>
                                <p className="hub-card__desc">View, create, and manage GitHub issues for this repo in a
                                    kanban board.</p>
                                <div className="hub-card__tags">
                                    <span className="hub-card__tag">Dev Only</span>
                                    <span className="hub-card__tag">GitHub</span>
                                </div>
                                <div className="hub-card__btn-group">
                                    <button className="hub-card__play-btn" onClick={() => onSelectGame('kanban')}>
                                        Open Board
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HubScreen;
