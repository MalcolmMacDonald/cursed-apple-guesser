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
        <div style={{
            position: 'fixed',
            bottom: 8,
            right: 12,
            zIndex: 9999,
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            color: 'rgba(255,255,255,0.35)',
            background: 'rgba(0,0,0,0.45)',
            padding: '3px 8px',
            borderRadius: 6,
            pointerEvents: 'none',
            userSelect: 'none',
            letterSpacing: '0.03em',
        }}>
            dev build · {label}
        </div>
    );
}
