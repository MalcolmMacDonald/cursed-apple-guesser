import React from 'react';
import type { GameDefinition, BaseGameState, GameFlowScreen } from './types';

interface GameFlowProps<TState extends BaseGameState> {
    definition: GameDefinition<TState>;
    onExit?: () => void;
    initialStart?: { seed: string; isDaily: boolean };
}

function GameFlow<TState extends BaseGameState>({ definition, onExit, initialStart }: GameFlowProps<TState>) {
    const [screen, setScreen] = React.useState<GameFlowScreen>('landing');
    const [state, setState] = React.useState<TState | null>(null);

    const { Landing, Round, Scoring, Final } = definition.screens;

    function handleStart(seed: string, isDaily: boolean) {
        setState(definition.initState(seed, isDaily));
        setScreen('game');
    }

    // Skip landing if initialStart was provided (e.g. daily challenge from hub)
    React.useEffect(() => {
        if (initialStart) {
            handleStart(initialStart.seed, initialStart.isDaily);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleRoundSubmit(updatedState: TState) {
        setState(updatedState);
        setScreen('intermediate_scoring');
    }

    function handleScoringContinue(score: number) {
        const newState = {
            ...state!,
            scores: [...state!.scores, score],
            currentRound: state!.currentRound + 1,
        } as TState;
        setState(newState);
        setScreen(newState.currentRound >= newState.totalRounds ? 'final_scoring' : 'game');
    }

    function handlePlayAgain() {
        setState(null);
        setScreen('landing');
    }

    return (
        <>
            {screen === 'landing' && (
                <Landing onStart={handleStart} onExit={onExit} />
            )}
            {screen === 'game' && state !== null && (
                <Round state={state} onSubmit={handleRoundSubmit} />
            )}
            {screen === 'intermediate_scoring' && state !== null && (
                <Scoring state={state} onContinue={handleScoringContinue} />
            )}
            {screen === 'final_scoring' && state !== null && (
                <Final state={state} onPlayAgain={handlePlayAgain} />
            )}
        </>
    );
}

export default GameFlow;
