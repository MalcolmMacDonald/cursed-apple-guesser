import './App.css'

import React from "react";
import GameController from "./controllers/game-controller.tsx";
import HubScreen from "./screens/hub/index.tsx";
import TopBar, { TOPBAR_HEIGHT } from "./components/top-bar/index.tsx";

type TopLevelScreen = 'hub' | 'geoguesser';

function App() {
    document.body.style.userSelect = 'none';

    const [screen, setScreen] = React.useState<TopLevelScreen>('hub');

    return (
        <>
            <TopBar
                currentGame={screen === 'geoguesser' ? 'Cursed Apple Guesser' : undefined}
                onHome={() => setScreen('hub')}
            />
            <div style={{ paddingTop: TOPBAR_HEIGHT }}>
                {screen === 'hub' && (
                    <HubScreen onSelectGame={(id) => {
                        if (id === 'geoguesser') setScreen('geoguesser');
                    }} />
                )}
                {screen === 'geoguesser' && (
                    <GameController onExit={() => setScreen('hub')} />
                )}
            </div>
        </>
    );
}

export default App;
