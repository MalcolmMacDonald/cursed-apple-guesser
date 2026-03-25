import './round.css';
import React from 'react';
import MapSelection from '../../../components/map-selection';
import type {LGGameState} from '../LocationGuesserFlow';

function Round({state, onSubmit}: { state: LGGameState; onSubmit: (state: LGGameState) => void }) {
    const location = state.locations[state.currentRound];

    React.useEffect(() => {
        state.locations.forEach(loc => {
            const img = new Image();
            img.src = `locations/${loc.fileName}`;
        });
    }, []);

    return (
        <div className="game-screen" draggable={false}>
            <img src={`/locations/${location.fileName}`} alt="Location" className="game-bg"/>
            {(import.meta.env.DEV) && (
                <div className="round-dev-overlay">
                    <div>{location.fileName}</div>
                    {location.tags && location.tags.length > 0 && (
                        <div className="round-dev-overlay__tags">{location.tags.join(', ')}</div>
                    )}
                </div>
            )}
            <MapSelection
                onSubmit={(guessLocation, isFlipped, showUnderground) => {
                    onSubmit({
                        ...state,
                        guesses: [...state.guesses, guessLocation],
                        flips: [...state.flips, isFlipped],
                        undergrounds: [...state.undergrounds, showUnderground],
                    });
                }}
            />
        </div>
    );
}

export default Round;
