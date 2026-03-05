import MapSelection from '../../../components/map-selection';
import type { RoundProps } from '../../../game-engine/types';
import type { LGGameState } from '../definition';

function LGRound({ state, onSubmit }: RoundProps<LGGameState>) {
    const location = state.locations[state.currentRound];

    return (
        <div className="game-screen" draggable={false}>
            <img src={`locations/${location.fileName}`} alt="Location" className="game-bg" />
            {import.meta.env.DEV && (
                <div style={{
                    position: 'absolute', top: 8, left: 8, zIndex: 10,
                    background: 'rgba(0,0,0,0.65)', color: '#fff',
                    padding: '3px 8px', borderRadius: 6, fontSize: 11, fontFamily: 'monospace',
                    pointerEvents: 'none',
                }}>
                    {location.fileName}
                </div>
            )}
            <MapSelection
                onSubmit={(guessLocation, isFlipped) => {
                    onSubmit({ ...state, guesses: [...state.guesses, guessLocation], flips: [...state.flips, isFlipped] });
                }}
            />
        </div>
    );
}

export default LGRound;
