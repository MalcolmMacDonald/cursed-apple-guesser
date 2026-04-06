import './top-bar.css';

export const TOPBAR_HEIGHT = 52;

function TopBar() {
    const pathname = window.location.pathname;
    const base = import.meta.env.BASE_URL;
    const relativePath = pathname.startsWith(base) ? pathname.slice(base.length - 1) : pathname;

    const currentGame =
        relativePath.startsWith('/play') ? 'Location Guesser' :
            relativePath.startsWith('/smoke-ranking') ? 'Smoke Spot Leaderboard' :
                relativePath.startsWith('/dev/github-kanban') ? 'Issue Tracker' :
                    undefined;

    const handleHomeClick = () => {
        if (relativePath.startsWith('/dev/github-kanban')) {
            window.location.href = 'https://map-trainer.lloc.ca/dev';
        } else {
            window.location.href = base;
        }
    };

    return (
        <div className="topbar">
            <button className="topbar__home-btn" onClick={handleHomeClick}>
                <span className="topbar__icon">🎮</span>
                Game Hub
            </button>
            {currentGame && (
                <>
                    <span className="topbar__separator">›</span>
                    <span className="topbar__game-name">{currentGame}</span>
                </>
            )}
        </div>
    );
}

export default TopBar;
