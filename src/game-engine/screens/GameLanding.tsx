import React from 'react';
import {makeRandomSeed} from '../../utils/rng';
import type {LandingProps} from '../types';

interface GameLandingProps extends LandingProps {
    icon: string;
    title: string;
    subtitle: string;
    children?: React.ReactNode;
}

function GameLanding({icon, title, subtitle, onStart, children}: GameLandingProps) {

    // Stable random seed for this mount — new seed each time the component remounts (Play Again)
    const randomSeed = React.useRef(makeRandomSeed()).current;

    return (
        <div className="landing">
            <div className="landing__icon">{icon}</div>
            <div className="landing__text">
                <h1 className="landing__title">{title}</h1>
                <p className="landing__subtitle">{subtitle}</p>
            </div>
            {children}
            <button className="landing__start-btn" onClick={() => onStart(randomSeed, false)}>
                Start Game
            </button>
        </div>
    );
}

export default GameLanding;
