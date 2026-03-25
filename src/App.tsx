import './App.css';

import React from 'react';
import {useLocation} from 'wouter';
import LocationGuesserFlow from './games/location-guesser/LocationGuesserFlow';
import HubScreen from './screens/hub/index.tsx';
import TopBar from './components/top-bar/index.tsx';
import {makeDailyDate} from './utils/rng';
import KanbanScreen from './screens/kanban/index.tsx';
import BuildBadge from './components/build-badge/index.tsx';

function App() {
    document.body.style.userSelect = 'none';
    const [location, navigate] = useLocation();

    const isPlay = location.startsWith('/play');
    const isKanban = location === '/dev/issue-tracker';

    function handleSelectGame(id: string, isDaily?: boolean) {
        if (id === 'location-guesser') {
            navigate(isDaily ? `/play?seed=${makeDailyDate()}&daily=true` : '/play');
        }
        if (id === 'kanban') navigate('/dev/issue-tracker');
    }

    return (
        <>
            <BuildBadge/>
            <TopBar/>
            <div className="app-content">
                {!isPlay && !isKanban && (
                    <HubScreen onSelectGame={handleSelectGame}/>
                )}
                {isPlay && (
                    <LocationGuesserFlow/>
                )}
                {isKanban && import.meta.env.DEV && (
                    <KanbanScreen onBack={() => navigate('/')}/>
                )}
            </div>
        </>
    );
}

export default App;
