import MapSelection from '../../../components/map-selection';
import type { RoundProps } from '../../../game-engine/types';
import type { LGGameState } from '../definition';

function LGRound({ state, onSubmit }: RoundProps<LGGameState>) {
    const location = state.locations[state.currentRound];

    return (
        <div className="game-screen" draggable={false}>
            <img src={`locations/${location.fileName}`} alt="Location" className="game-bg" />
            <MapSelection
                onSubmit={(guessLocation) => {
                    onSubmit({ ...state, guesses: [...state.guesses, guessLocation] });
                }}
            />
        </div>
    );
}

export default LGRound;
