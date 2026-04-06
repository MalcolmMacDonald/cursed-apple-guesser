import './hub.css';
import React from 'react';
import {makeDailyDate, makeLocalDate, nextLocalMidnightMs} from '../../utils/rng';
import {LG_DAILY_KEY, LG_DAILY_SCORE_KEY, LG_ROUND_COUNT} from '../../games/location-guesser/LocationGuesserFlow';
import DailyHistogram from '../../components/daily-histogram';
import type {HistogramData} from '../../components/daily-histogram';

const BASE = import.meta.env.BASE_URL;

const LG_API_URL = 'https://malloc--b83909f4289a11f1b97142dde27851f2.web.val.run';
const IS_DEV_DEPLOY = import.meta.env.DEV || import.meta.env.VITE_BASE_PATH === '/dev/';
const PAST_HISTOGRAMS_START = '2026-03-26';

function getPastDates(): string[] {
    const dates: string[] = [];
    const start = new Date(PAST_HISTOGRAMS_START + 'T00:00:00');
    const today = new Date(makeLocalDate() + 'T00:00:00');
    const current = new Date(start);
    while (current <= today) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
        current.setDate(current.getDate() + 1);
    }
    return dates.reverse();
}

function PastHistogramsSection() {
    const [histograms, setHistograms] = React.useState<Record<string, HistogramData>>({});

    React.useEffect(() => {
        const dates = getPastDates();
        dates.forEach(date => {
            fetch(`${LG_API_URL}/scores?date=${date}`)
                .then(r => r.json())
                .then((data: HistogramData) => {
                    setHistograms(prev => ({...prev, [date]: data}));
                })
                .catch(() => {/* silently fail */
                });
        });
    }, []);

    const dates = getPastDates();

    return (
        <div className="hub-past-histograms">
            <div className="hub-dev-header">
                <span className="hub-dev-badge">DEV</span>
                <span className="hub-dev-label">Past Daily Histograms</span>
            </div>
            <div className="hub-past-histograms__grid">
                {dates.map(date => (
                    <div key={date} className="hub-past-histograms__item">
                        {histograms[date] ? (
                            <DailyHistogram
                                histogram={histograms[date]}
                                playerScore={0}
                                totalRounds={LG_ROUND_COUNT}
                                title={`${date} — ${histograms[date].totalCount} ${histograms[date].totalCount === 1 ? 'player' : 'players'}`}
                            />
                        ) : (
                            <div className="hub-past-histograms__loading">{date}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function HubDailyHistogram({playerScore, totalRounds}: { playerScore: number; totalRounds: number }) {
    const [histogram, setHistogram] = React.useState<HistogramData | null>(null);

    React.useEffect(() => {
        const date = makeLocalDate();
        fetch(`${LG_API_URL}/scores?date=${date}`)
            .then(r => r.json())
            .then((data: HistogramData) => setHistogram(data))
            .catch(() => {/* silently fail */
            });
    }, []);

    if (!histogram) return null;

    return <DailyHistogram histogram={histogram} playerScore={playerScore} totalRounds={totalRounds}/>;
}

type GameEntry = {
    id: string;
    title: string;
    description: string;
    icon: string;
    gradient: string;
    available: boolean;
    tags: string[];
    dailyStorageKey?: string;
    primaryLabel?: string;
    leaderboardId?: string;
};

const games: GameEntry[] = [
    {
        id: "location-guesser",
        title: "Location Guesser",
        description: "Drop a pin on the map to guess where a screenshot was taken. The closer you are, the higher you score.",
        icon: "🗺️",
        gradient: "linear-gradient(135deg, #1a472a 0%, #2d6a4f 50%, #40916c 100%)",
        available: true,
        tags: ["Location"],
        dailyStorageKey: LG_DAILY_KEY,
    },
    {
        id: "smoke-ranking",
        title: "Smoke Spot Leaderboard",
        description: "Two screenshots. One question: which spot would you rather smoke at? Vote to build the community leaderboard of top smoke spots.",
        icon: "🌿",
        gradient: "linear-gradient(135deg, #1a0a2e 0%, #3b1f6b 50%, #6d28d9 100%)",
        available: true,
        tags: ["Community", "Ranking"],
        primaryLabel: "Vote Now",
        leaderboardId: "smoke-ranking",
    },
    {
        id: "navigate",
        title: "Dead Reckoning",
        description: "You're shown a start and a destination. Give step-by-step directions — forward, left, turn around — to get there.",
        icon: "🧭",
        gradient: "linear-gradient(135deg, #3d2000 0%, #7a4500 50%, #b86800 100%)",
        available: false,
        tags: ["Navigation"],
    },
    {
        id: "nameit",
        title: "Name That Spot",
        description: "Recognise the location — but can you name it? Pick the correct name from a list of options.",
        icon: "📍",
        gradient: "linear-gradient(135deg, #1a1a4e 0%, #2d2d8f 50%, #4a4ac4 100%)",
        available: false,
        tags: ["Multiple Choice"],
    },
    {
        id: "aboutface",
        title: "About Face",
        description: "Study the screenshot carefully, then pick which other screenshot was taken facing the exact opposite direction.",
        icon: "🔄",
        gradient: "linear-gradient(135deg, #3d001a 0%, #7a0035 50%, #b80050 100%)",
        available: false,
        tags: ["Orientation"],
    },
];

function useDailyCountdown(): string {
    const [text, setText] = React.useState('');
    React.useEffect(() => {
        const update = () => {
            const diff = nextLocalMidnightMs() - Date.now();
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

export const LG_PENDING_SEED_KEY = 'lg_pending_seed';
export const LG_PENDING_DAILY_KEY = 'lg_pending_daily';

function navigateTo(path: string) {
    window.location.href = BASE + path;
}

function navigateToPlay(isDaily: boolean) {
    if (isDaily) {
        sessionStorage.setItem(LG_PENDING_SEED_KEY, makeDailyDate());
        sessionStorage.setItem(LG_PENDING_DAILY_KEY, 'true');
    }
    navigateTo('play/');
}

const gameRoutes: Record<string, { play: () => void; daily?: () => void; leaderboard?: string }> = {
    'location-guesser': {
        play: () => navigateToPlay(false),
        daily: () => navigateToPlay(true),
    },
    'smoke-ranking': {
        play: () => navigateTo('smoke-ranking/'),
        leaderboard: 'smoke-ranking/?view=leaderboard',
    },
    'kanban': {
        play: () => navigateTo('issue-tracker/'),
    },
};

function GameCard({game}: {
    game: GameEntry;
}) {
    const actuallyDone = game.dailyStorageKey
        ? localStorage.getItem(game.dailyStorageKey) === makeDailyDate()
        : false;
    //if in dev mode, always set daily done to false so the daily can always be replayed
    const dailyDone = import.meta.env.DEV ? false : actuallyDone;
    const countdown = useDailyCountdown();
    // In dev mode, always show the histogram regardless of completion state
    const dailyScore = (actuallyDone || import.meta.env.DEV) && game.dailyStorageKey === LG_DAILY_KEY
        ? Number(localStorage.getItem(LG_DAILY_SCORE_KEY) ?? 0)
        : null;

    return (
        <div className={`hub-card${game.available ? '' : ' hub-card--disabled'}`}>
            <div className="hub-card__art" style={{background: game.gradient}}>
                <span className="hub-card__icon">{game.icon}</span>
            </div>
            <div className="hub-card__body">
                <p className="hub-card__title">{game.title}</p>
                <p className="hub-card__desc">{game.description}</p>

                {game.available ? (
                    <div className="hub-card__btn-group">
                        {game.dailyStorageKey && (
                            <>
                                <button
                                    className="hub-card__daily-btn"
                                    onClick={() => gameRoutes[game.id]?.daily?.()}
                                    disabled={dailyDone}
                                >
                                    {dailyDone ? 'Daily Done ✓' : 'Daily Challenge'}
                                </button>
                                {dailyDone && (
                                    <p className="hub-card__daily-timer">Next in {countdown}</p>
                                )}
                                {dailyScore !== null && (
                                    <HubDailyHistogram playerScore={dailyScore} totalRounds={LG_ROUND_COUNT}/>
                                )}
                            </>
                        )}
                        {game.leaderboardId && (
                            <button className="hub-card__daily-btn"
                                    onClick={() => navigateTo(gameRoutes[game.id]?.leaderboard ?? '')}>
                                View Leaderboard
                            </button>
                        )}
                        <button className="hub-card__play-btn" onClick={() => gameRoutes[game.id]?.play()}>
                            {game.primaryLabel ?? 'Play Now'}
                        </button>
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

function HubScreen() {
    const isDev = import.meta.env.DEV;

    React.useEffect(() => {
        document.title = isDev ? 'Deadlock Map Trainer (DEV)' : 'Deadlock Map Trainer';
        return () => {
            document.title = 'Deadlock Map Trainer';
        };
    }, [isDev]);

    return (
        <div className={`hub-page${isDev ? ' hub-page--dev' : ''}`}>
            <div className="hub-header">
                <h1 className={`hub-title${isDev ? ' hub-title--dev' : ''}`}>Deadlock Map Trainer</h1>
                <p className="hub-subtitle">
                    Test your knowledge of the Deadlock map.
                </p>
            </div>

            <div className="hub-divider"/>
            <div className="hub-grid">
                {games.filter(game => game.available).map(game => (
                    <GameCard
                        key={game.id}
                        game={game}
                    />
                ))}
            </div>


            <div className="hub-divider"/>
            <div className="hub-grid">
                {games.filter(game => !game.available).map(game => (
                    <GameCard
                        key={game.id}
                        game={game}
                    />
                ))}
            </div>


            {IS_DEV_DEPLOY && (
                <div className="hub-dev-section">
                    <div className="hub-divider"/>
                    <PastHistogramsSection/>
                </div>
            )}

            {import.meta.env.DEV && (
                <div className="hub-dev-section">
                    <div className="hub-divider"/>
                    <div className="hub-dev-header">
                        <span className="hub-dev-badge">DEV</span>
                        <span className="hub-dev-label">Developer Tools</span>
                    </div>
                    <div className="hub-grid">
                        <div className="hub-card" onClick={() => navigateTo('issue-tracker/')}>
                            <div className="hub-card__art"
                                 style={{background: 'linear-gradient(135deg, #1e1e2e 0%, #313244 50%, #45475a 100%)'}}>
                                <span className="hub-card__icon">📋</span>
                            </div>
                            <div className="hub-card__body">
                                <p className="hub-card__title">Issue Tracker</p>
                                <p className="hub-card__desc">View, create, and manage GitHub issues for this repo in a
                                    kanban board.</p>
                                <div className="hub-card__btn-group">
                                    <button className="hub-card__play-btn"
                                            onClick={() => navigateTo('issue-tracker/')}>
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
