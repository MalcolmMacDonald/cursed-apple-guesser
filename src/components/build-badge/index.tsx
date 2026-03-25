import './build-badge.css';

const IS_DEV_DEPLOY = import.meta.env.VITE_BASE_PATH === '/dev/';

export default function BuildBadge() {
    if (!IS_DEV_DEPLOY) return null;

    const ts = new Date(__BUILD_TIME__);
    const label = ts.toLocaleString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short',
    });

    return (
        <div className="build-badge">
            dev build · {label}
        </div>
    );
}
