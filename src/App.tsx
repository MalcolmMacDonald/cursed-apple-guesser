import './App.css';

import React from 'react';
import GameFlow from './game-engine/GameFlow';
import { locationGuesserDefinition } from './games/location-guesser/definition';
import { deadReckoningDefinition } from './games/dead-reckoning/definition';
import HubScreen from './screens/hub/index.tsx';
import TopBar from './components/top-bar/index.tsx';
import { makeDailyDate } from './utils/rng';

type TopLevelScreen = 'hub' | 'geoguesser' | 'dead-reckoning';

type InitialStart = { seed: string; isDaily: boolean };

function App() {
    document.body.style.userSelect = 'none';

    const [screen, setScreen] = React.useState<TopLevelScreen>('hub');
    const [initialStart, setInitialStart] = React.useState<InitialStart | undefined>(undefined);

    const currentGame =
        screen === 'geoguesser' ? 'Location Guesser' :
        screen === 'dead-reckoning' ? 'Dead Reckoning' :
        undefined;

    function handleSelectGame(id: string, isDaily?: boolean) {
        const start = isDaily ? { seed: makeDailyDate(), isDaily: true } : undefined;
        setInitialStart(start);
        if (id === 'geoguesser') setScreen('geoguesser');
        if (id === 'navigate') setScreen('dead-reckoning');
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
            </div>
        </>
    );
}

export default App;
