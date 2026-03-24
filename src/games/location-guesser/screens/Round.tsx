import React from 'react';
import MapSelection from '../../../components/map-selection';
import type {RoundProps} from '../../../game-engine/types';
import type {LGGameState} from '../definition';

function LGRound({state, onSubmit}: RoundProps<LGGameState>) {
    const location = state.locations[state.currentRound];

    React.useEffect(() => {
        state.locations.forEach(loc => {
            const img = new Image();
            img.src = `locations/${loc.fileName}`;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="game-screen" draggable={false}>
            <img src={`locations/${location.fileName}`} alt="Location" className="game-bg"/>
            {(import.meta.env.DEV || import.meta.env.BASE_URL !== '/') && (
                <div style={{
                    position: 'absolute', top: 8, left: 8, zIndex: 100,
                    background: 'rgba(0,0,0,0.65)', color: '#fff',
                    padding: '3px 8px', borderRadius: 6, fontSize: 11, fontFamily: 'monospace',
                    userSelect: 'text'
                }}>
                    <div
                    >{location.fileName}</div>
                    {location.tags && location.tags.length > 0 && (
                        <div style={{marginTop: 2, color: '#adf'}}>{location.tags.join(', ')}</div>
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

export default LGRound;
