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
        id: "geoguesser",
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
        available: true,
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

function GameCard({game, onPlay, onPlayDaily}: { game: GameEntry; onPlay: () => void; onPlayDaily?: () => void }) {
    const dailyDone = game.dailyStorageKey
        ? localStorage.getItem(game.dailyStorageKey) === makeDailyDate()
        : false;

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
                            <button
                                className="hub-card__daily-btn"
                                onClick={onPlayDaily}
                                disabled={dailyDone}
                            >
                                {dailyDone ? 'Daily Done ✓' : 'Daily Challenge'}
                            </button>
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
    return (
        <div className="hub-page">
            <div className="hub-header">
                <div className="hub-badge">Game Hub</div>
                <h1 className="hub-title">Deadlock Map Trainer</h1>
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
        </div>
    );
}

export default HubScreen;
