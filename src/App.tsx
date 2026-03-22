import './App.css';

import React from 'react';
import GameFlow from './game-engine/GameFlow';
import {locationGuesserDefinition} from './games/location-guesser/definition';
import {deadReckoningDefinition} from './games/dead-reckoning/definition';
import HubScreen from './screens/hub/index.tsx';
import TopBar from './components/top-bar/index.tsx';
import {makeDailyDate} from './utils/rng';
import KanbanScreen from './screens/kanban/index.tsx';
import BuildBadge from './components/build-badge/index.tsx';

type TopLevelScreen = 'hub' | 'location-guesser' | 'dead-reckoning' | 'kanban';

type InitialStart = { seed: string; isDaily: boolean };

const KANBAN_PATH = '/dev/issue-tracker';

function App() {
    document.body.style.userSelect = 'none';

    const [screen, setScreen] = React.useState<TopLevelScreen>(() =>
        window.location.pathname === KANBAN_PATH ? 'kanban' : 'hub'
    );
    const [initialStart, setInitialStart] = React.useState<InitialStart | undefined>(undefined);

    React.useEffect(() => {
        function handlePopState() {
            setScreen(window.location.pathname === KANBAN_PATH ? 'kanban' : 'hub');
        }

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    React.useEffect(() => {
        if (screen === 'kanban') {
            if (window.location.pathname !== KANBAN_PATH)
                window.history.pushState({}, '', KANBAN_PATH);
        } else if (window.location.pathname === KANBAN_PATH) {
            window.history.pushState({}, '', '/');
        }
    }, [screen]);

    const currentGame =
        screen === 'location-guesser' ? 'Location Guesser' :
            screen === 'dead-reckoning' ? 'Dead Reckoning' :
                screen === 'kanban' ? 'Issue Tracker' :
                    undefined;

    function handleSelectGame(id: string, isDaily?: boolean) {
        const start = isDaily ? {seed: makeDailyDate(), isDaily: true} : undefined;
        setInitialStart(start);
        if (id === 'location-guesser') setScreen('location-guesser');
        if (id === 'navigate') setScreen('dead-reckoning');
        if (id === 'kanban') setScreen('kanban');
    }

    return (
        <>
            <BuildBadge/>
            <TopBar
                currentGame={currentGame}
                onHome={() => setScreen('hub')}
            />
            <div className="app-content">
                {screen === 'hub' && (
                    <HubScreen onSelectGame={handleSelectGame}/>
                )}
                {screen === 'location-guesser' && (
                    <GameFlow
                        definition={locationGuesserDefinition}
                        initialStart={initialStart}
                        onExit={() => setScreen('hub')}
                    />
                )}
                {screen === 'dead-reckoning' && (
                    <GameFlow
                        definition={deadReckoningDefinition}
                        initialStart={initialStart}
                        onExit={() => setScreen('hub')}
                    />
                )}
                {screen === 'kanban' && import.meta.env.DEV && (
                    <KanbanScreen onBack={() => setScreen('hub')}/>
                )}
            </div>
        </>
    );
}

export default App;
