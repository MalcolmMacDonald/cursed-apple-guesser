import './App.css';

import React from 'react';
import GameFlow from './game-engine/GameFlow';
import { locationGuesserDefinition } from './games/location-guesser/definition';
import { deadReckoningDefinition } from './games/dead-reckoning/definition';
import HubScreen from './screens/hub/index.tsx';
import TopBar from './components/top-bar/index.tsx';
import { makeDailyDate } from './utils/rng';
import KanbanScreen from './screens/kanban/index.tsx';

type TopLevelScreen = 'hub' | 'geoguesser' | 'dead-reckoning' | 'kanban';

type InitialStart = { seed: string; isDaily: boolean };

function App() {
    document.body.style.userSelect = 'none';

    const [screen, setScreen] = React.useState<TopLevelScreen>('hub');
    const [initialStart, setInitialStart] = React.useState<InitialStart | undefined>(undefined);

    const currentGame =
        screen === 'geoguesser' ? 'Location Guesser' :
        screen === 'dead-reckoning' ? 'Dead Reckoning' :
        screen === 'kanban' ? 'Issue Tracker' :
        undefined;

    function handleSelectGame(id: string, isDaily?: boolean) {
        const start = isDaily ? { seed: makeDailyDate(), isDaily: true } : undefined;
        setInitialStart(start);
        if (id === 'geoguesser') setScreen('geoguesser');
        if (id === 'navigate') setScreen('dead-reckoning');
        if (id === 'kanban') setScreen('kanban');
    }

    return (
        <>
            <TopBar
                currentGame={currentGame}
                onHome={() => setScreen('hub')}
            />
            <div className="app-content">
                {screen === 'hub' && (
                    <HubScreen onSelectGame={handleSelectGame} />
                )}
                {screen === 'geoguesser' && (
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
                    <KanbanScreen onBack={() => setScreen('hub')} />
                )}
            </div>
        </>
    );
}

export default App;
