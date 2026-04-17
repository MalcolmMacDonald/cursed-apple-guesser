import './hub.css';
import React from 'react';
import {makeDailyDate, makeLocalDate, nextLocalMidnightMs} from '../../utils/rng';
import {LG_DAILY_KEY, LG_DAILY_SCORE_KEY, LG_ROUND_COUNT, LG_PENDING_SEED_KEY, LG_PENDING_DAILY_KEY} from '../../games/location-guesser/LocationGuesserFlow';
import {LG_API_URL} from '../../config';
import DailyHistogram from '../../components/daily-histogram';
import type {HistogramData} from '../../components/daily-histogram';

const BASE = import.meta.env.BASE_URL;

const IS_DEV_DEPLOY = import.meta.env.DEV || import.meta.env.VITE_BASE_PATH === '/dev/';
const PAST_HISTOGRAMS_START = '2026-03-26';

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

function DailyPlayersGraph() {
    const [counts, setCounts] = React.useState<Record<string, number>>({});

    React.useEffect(() => {
        getPastDates().forEach(date => {
            fetch(`${LG_API_URL}/scores?date=${date}`)
                .then(r => r.json())
                .then((data: HistogramData) => setCounts(prev => ({...prev, [date]: data.totalCount})))
                .catch(() => {});
        });
    }, []);

    const dates = getPastDates().slice().reverse(); // chronological: oldest → newest
    const maxCount = Math.max(1, ...dates.map(d => counts[d] ?? 0));
    const totalPlayers = dates.reduce((sum, d) => sum + (counts[d] ?? 0), 0);

    return (
        <div style={{width: '100%', maxWidth: 1200, padding: '0 24px'}}>
            <div className="hub-dev-header">
                <span className="hub-dev-badge">DEV</span>
                <span className="hub-dev-label">Daily Challenge Players — {totalPlayers} total</span>
            </div>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 4, paddingBottom: 2, overflowX: 'auto'}}>
                {dates.map(date => {
                    const loaded = date in counts;
                    const count = counts[date] ?? 0;
                    const barH = loaded ? Math.max(count > 0 ? 4 : 0, Math.round((count / maxCount) * 80)) : 0;
                    return (
                        <div key={date} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 30}}>
                            <span style={{fontSize: 10, color: 'rgba(255,255,255,0.55)', height: 14, lineHeight: '14px', textAlign: 'center'}}>
                                {loaded ? count : '·'}
                            </span>
                            <div
                                style={{
                                    width: 26,
                                    height: barH,
                                    background: 'rgba(99, 102, 241, 0.7)',
                                    borderRadius: '3px 3px 0 0',
                                }}
                                title={`${date}: ${count} player${count !== 1 ? 's' : ''}`}
                            />
                            <span style={{fontSize: 9, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap'}}>
                                {date.slice(5)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
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
                .catch(() => {/* silently fail */});
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
            .catch(() => {/* silently fail */});
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
    /** localStorage key checked against makeDailyDate() to mark the daily as done */
    dailyStorageKey?: string;
    /** localStorage key for the daily score value; presence enables the histogram */
    dailyScoreKey?: string;
    /** round count passed to the histogram when dailyScoreKey is set */
    totalRounds?: number;
    primaryLabel?: string;
    /** path (relative to BASE) to navigate to for the leaderboard view */
    leaderboardPath?: string;
    onPlay?: () => void;
    onDaily?: () => void;
};

const games: GameEntry[] = [
    {
        id: 'location-guesser',
        title: 'Location Guesser',
        description: 'Drop a pin on the map to guess where a screenshot was taken. The closer you are, the higher you score.',
        icon: '🗺️',
        gradient: 'linear-gradient(135deg, #1a472a 0%, #2d6a4f 50%, #40916c 100%)',
        available: true,
        tags: ['Location'],
        dailyStorageKey: LG_DAILY_KEY,
        dailyScoreKey: LG_DAILY_SCORE_KEY,
        totalRounds: LG_ROUND_COUNT,
        onPlay: () => navigateToPlay(false),
        onDaily: () => navigateToPlay(true),
    },
    {
        id: 'smoke-ranking',
        title: 'Smoke Spot Leaderboard',
        description: 'Two screenshots. One question: which spot would you rather smoke at? Vote to build the community leaderboard of top smoke spots.',
        icon: '🌿',
        gradient: 'linear-gradient(135deg, #1a0a2e 0%, #3b1f6b 50%, #6d28d9 100%)',
        available: true,
        tags: ['Community', 'Ranking'],
        primaryLabel: 'Vote Now',
        leaderboardPath: 'smoke-ranking/?view=leaderboard',
        onPlay: () => navigateTo('smoke-ranking/'),
    },
    {
        id: 'navigate',
        title: 'Dead Reckoning',
        description: "You're shown a start and a destination. Give step-by-step directions — forward, left, turn around — to get there.",
        icon: '🧭',
        gradient: 'linear-gradient(135deg, #3d2000 0%, #7a4500 50%, #b86800 100%)',
        available: false,
        tags: ['Navigation'],
    },
    {
        id: 'nameit',
        title: 'Name That Spot',
        description: 'Recognise the location — but can you name it? Pick the correct name from a list of options.',
        icon: '📍',
        gradient: 'linear-gradient(135deg, #1a1a4e 0%, #2d2d8f 50%, #4a4ac4 100%)',
        available: false,
        tags: ['Multiple Choice'],
    },
    {
        id: 'aboutface',
        title: 'About Face',
        description: 'Study the screenshot carefully, then pick which other screenshot was taken facing the exact opposite direction.',
        icon: '🔄',
        gradient: 'linear-gradient(135deg, #3d001a 0%, #7a0035 50%, #b80050 100%)',
        available: false,
        tags: ['Orientation'],
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

function GameCard({game}: { game: GameEntry }) {
    const actuallyDone = game.dailyStorageKey
        ? localStorage.getItem(game.dailyStorageKey) === makeDailyDate()
        : false;
    // In dev mode always allow replaying the daily
    const dailyDone = import.meta.env.DEV ? false : actuallyDone;
    const countdown = useDailyCountdown();
    const dailyScore = (actuallyDone || import.meta.env.DEV) && game.dailyScoreKey
        ? Number(localStorage.getItem(game.dailyScoreKey) ?? 0)
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
                        {game.dailyStorageKey && game.onDaily && (
                            <>
                                <button
                                    className="hub-card__daily-btn"
                                    onClick={game.onDaily}
                                    disabled={dailyDone}
                                >
                                    {dailyDone ? 'Daily Done ✓' : 'Daily Challenge'}
                                </button>
                                {dailyDone && (
                                    <p className="hub-card__daily-timer">Next in {countdown}</p>
                                )}
                                {dailyScore !== null && game.totalRounds !== undefined && (
                                    <HubDailyHistogram playerScore={dailyScore} totalRounds={game.totalRounds}/>
                                )}
                            </>
                        )}
                        {game.leaderboardPath && (
                            <button
                                className="hub-card__daily-btn"
                                onClick={() => navigateTo(game.leaderboardPath!)}
                            >
                                View Leaderboard
                            </button>
                        )}
                        <button className="hub-card__play-btn" onClick={game.onPlay}>
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
                    <GameCard key={game.id} game={game}/>
                ))}
            </div>

            <div className="hub-divider"/>
            <div className="hub-grid">
                {games.filter(game => !game.available).map(game => (
                    <GameCard key={game.id} game={game}/>
                ))}
            </div>

            {IS_DEV_DEPLOY && (
                <div className="hub-dev-section">
                    <div className="hub-divider"/>
                    <DailyPlayersGraph/>
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
                        <div className="hub-card" onClick={() => navigateTo('github-kanban/')}>
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
                                            onClick={() => navigateTo('github-kanban/')}>
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
