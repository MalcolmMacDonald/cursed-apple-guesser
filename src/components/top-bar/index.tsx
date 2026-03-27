import {useLocation} from 'wouter';
import './top-bar.css';

export const TOPBAR_HEIGHT = 52;

function TopBar() {
    const [location, navigate] = useLocation();
    const currentGame =
        location.startsWith('/play') ? 'Location Guesser' :
        location === '/dev/issue-tracker' ? 'Issue Tracker' :
        undefined;

    const handleHomeClick = () => {
        if (location === '/dev/issue-tracker') {
            window.location.href = 'https://map-trainer.lloc.ca/dev';
        } else {
            navigate('/');
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
