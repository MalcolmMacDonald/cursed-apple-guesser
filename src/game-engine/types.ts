import type {FC} from 'react';

/** Every game's state must include these base fields. GameFlow reads them to drive routing. */
export interface BaseGameState {
    currentRound: number;
    totalRounds: number;
    scores: RoundScore[];
    seed: string;
    isDaily: boolean;
    dailyDate?: string;
}

export interface RoundScore {
    score: number;
    maxScore: number;
}

export type GameFlowScreen = 'landing' | 'game' | 'intermediate_scoring' | 'final_scoring';

export interface LandingProps {
    onStart: (seed: string, isDaily: boolean, roundCount?: number) => void;
    onExit?: () => void;
}

export interface RoundProps<TState extends BaseGameState> {
    state: TState;
    onSubmit: (updatedState: TState) => void;
}

export interface ScoringProps<TState extends BaseGameState> {
    state: TState;
    onContinue: (score: RoundScore) => void;
}

export interface FinalProps<TState extends BaseGameState> {
    state: TState;
    onPlayAgain: () => void;
    onExit?: () => void;
}

/**
 * Declarative description of a game's user flow.
 * Each game exports one of these — the GameFlow component does the rest.
 */
export interface GameDefinition<TState extends BaseGameState> {
    name: string;
    dailyStorageKey: string;
    totalRounds: number;
    initState: (seed: string, isDaily: boolean, roundCount?: number) => TState;
    screens: {
        Landing: FC<LandingProps>;
        Round: FC<RoundProps<TState>>;
        Scoring: FC<ScoringProps<TState>>;
        Final: FC<FinalProps<TState>>;
    };
}
