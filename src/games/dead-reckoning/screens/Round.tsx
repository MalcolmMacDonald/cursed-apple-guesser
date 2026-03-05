import React from 'react';
import type { NavigationStep } from '../../../types';
import type { RoundProps } from '../../../game-engine/types';
import type { DRGameState } from '../definition';
import { applyTurn, getStepLabel, FACING_INFO } from '../utils';

function DRRound({ state, onSubmit }: RoundProps<DRGameState>) {
    const pair = state.pairs[state.currentRound];
    const startFacing = state.startFacings[state.currentRound];

    const [steps, setSteps] = React.useState<NavigationStep[]>([]);
    const [facing, setFacing] = React.useState(startFacing);

    React.useEffect(() => {
        setSteps([]);
        setFacing(startFacing);
    }, [state.currentRound, startFacing]);

    const facingInfo = FACING_INFO[facing] ?? { label: '?', arrow: '?' };

    const handleTurn = (dir: 'left' | 'right' | 'uturn') => {
        setFacing(applyTurn(facing, dir));
        setSteps((prev) => [...prev, { type: 'turn', direction: dir }]);
    };

    const handleMove = (distance: 'short' | 'medium' | 'long') => {
        setSteps((prev) => [...prev, { type: 'move', distance }]);
    };

    const removeStep = (index: number) => {
        const next = steps.filter((_, i) => i !== index);
        let f = startFacing;
        for (const s of next) {
            if (s.type === 'turn') f = applyTurn(f, s.direction);
        }
        setFacing(f);
        setSteps(next);
    };

    const handleSubmit = () => {
        onSubmit({ ...state, allSteps: [...state.allSteps, steps] });
    };

    const hasMoveStep = steps.some((s) => s.type === 'move');

    return (
        <div className="dr-game">
            <div className="dr-game__screenshots">
                <div className="dr-game__screenshot-panel">
                    <img
                        src={`locations/${pair.start.fileName}`}
                        alt="Start location"
                        className="dr-game__img"
                        draggable={false}
                    />
                    <span className="dr-game__label">START</span>
                </div>
                <div className="dr-game__screenshot-divider" />
                <div className="dr-game__screenshot-panel">
                    <img
                        src={`locations/${pair.end.fileName}`}
                        alt="Destination"
                        className="dr-game__img"
                        draggable={false}
                    />
                    <span className="dr-game__label dr-game__label--dest">DESTINATION</span>
                </div>
            </div>

            <div className="dr-controls">
                <p className="dr-controls__round">
                    Round {state.currentRound + 1} / {state.totalRounds}
                </p>

                <div className="dr-facing">
                    Facing:&nbsp;
                    <span className="dr-facing__dir">
                        {facingInfo.arrow} {facingInfo.label}
                    </span>
                </div>

                <div className="dr-btn-row">
                    <button className="dr-btn dr-btn--turn" onClick={() => handleTurn('left')}>
                        ← Turn Left
                    </button>
                    <button className="dr-btn dr-btn--turn" onClick={() => handleTurn('uturn')}>
                        ↔ U-Turn
                    </button>
                    <button className="dr-btn dr-btn--turn" onClick={() => handleTurn('right')}>
                        Turn Right →
                    </button>
                </div>

                <div className="dr-btn-row">
                    <button className="dr-btn dr-btn--move" onClick={() => handleMove('short')}>
                        Walk Short
                    </button>
                    <button className="dr-btn dr-btn--move" onClick={() => handleMove('medium')}>
                        Walk Medium
                    </button>
                    <button className="dr-btn dr-btn--move" onClick={() => handleMove('long')}>
                        Walk Long
                    </button>
                </div>

                {steps.length > 0 && (
                    <ol className="dr-step-list">
                        {steps.map((_, i) => (
                            <li key={i} className="dr-step-list__item">
                                <span>{i + 1}. {getStepLabel(steps, i, startFacing)}</span>
                                <button className="dr-step-list__remove" onClick={() => removeStep(i)}>
                                    ×
                                </button>
                            </li>
                        ))}
                    </ol>
                )}

                <button
                    className="dr-submit-btn"
                    onClick={handleSubmit}
                    disabled={!hasMoveStep}
                    title={!hasMoveStep ? 'Add at least one Walk step' : undefined}
                >
                    Submit Directions
                </button>
            </div>
        </div>
    );
}

export default DRRound;
