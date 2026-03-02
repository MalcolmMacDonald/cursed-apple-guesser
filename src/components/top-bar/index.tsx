import './top-bar.css';

export const TOPBAR_HEIGHT = 52;

function TopBar({ currentGame, onHome }: {
    currentGame?: string;
    onHome: () => void;
}) {
    return (
        <div className="topbar">
            <button className="topbar__home-btn" onClick={onHome}>
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
