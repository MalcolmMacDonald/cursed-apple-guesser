import React from 'react';
import '../App.css';
import TopBar from './top-bar/index.tsx';
import BuildBadge from './build-badge/index.tsx';

function PageShell({children}: { children: React.ReactNode }) {
    React.useEffect(() => {
        document.body.style.userSelect = 'none';
    }, []);

    return (
        <>
            <BuildBadge/>
            <TopBar/>
            <div className="app-content">
                {children}
            </div>
        </>
    );
}

export default PageShell;
