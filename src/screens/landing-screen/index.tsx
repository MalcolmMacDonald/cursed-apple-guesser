//landing screen for Geoguessr style game

// @ts-ignore
import React from "react";
import {type GameData, type GameScreenName} from "../../types.ts";
import locations from "../../../public/locations/metadata.json";
import { TOPBAR_HEIGHT } from "../../components/top-bar";

import seedRandom from 'seedrandom';

const rountCount = 5;
const seed = (seedRandom()() * 1000).toFixed(0);
const random = seedRandom(seed);

function LandingScreen({setState, setGameData, onExit}: {
                           setState: (state: GameScreenName) => void,
                           setGameData: (gameData: GameData) => void,
                           onExit?: () => void,
                       }
) {

    const startLocations = locations.sort(() => 0.5 - random()).slice(0, rountCount);

    return (
        <div style={{
            height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
            width: '100%',
            background: 'linear-gradient(160deg, #0d0d1a 0%, #111122 50%, #0a0a16 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '28px',
            boxSizing: 'border-box',
        }}>
            <div style={{
                fontSize: '4rem',
                filter: 'drop-shadow(0 4px 24px rgba(64,145,108,0.5))',
            }}>🗺️
            </div>

            <div style={{textAlign: 'center'}}>
                <h1 style={{
                    margin: '0 0 10px',
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, #ffffff 30%, #6ee7b7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    Cursed Apple Guesser
                </h1>
                <p style={{
                    margin: 0,
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                }}>
                    5 rounds — guess the location on the map
                </p>
            </div>

            <button
                onClick={() => {
                    setGameData({
                        locations: startLocations,
                        currentRound: 0,
                        totalRounds: rountCount,
                        scores: [],
                        guesses: [],
                        seed: seed
                    });
                    setState('game');
                }}
                style={{
                    padding: '14px 48px',
                    background: 'rgba(40,145,108,0.9)',
                    border: 'none',
                    borderRadius: '14px',
                    color: '#ffffff',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.03em',
                    boxShadow: '0 8px 32px rgba(40,145,108,0.4)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={e => {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(40,145,108,0.55)';
                }}
                onMouseLeave={e => {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(40,145,108,0.4)';
                }}
            >
                Start Game
            </button>
        </div>
    );
}

export default LandingScreen;
