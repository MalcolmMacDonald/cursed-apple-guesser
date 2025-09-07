//show image from assets
//show title
//show map selection element

import MapSelection from "../../components/map-selection";
import locations from "/public/locations/metadata.json" with {type: "json"};
import React from "react";
import {type GameState, type LocationData} from "../../types";
import IntermediateScore from "../intermediate-score";

const rountCount = 3;

function Screen({location, onContinue}: {
    location: LocationData,
    onContinue: (location: { x: number, y: number }) => void
}) {

    //full background image, no scrolling
    return (
        <div className="game-screen" draggable={false}>
            <img src={`locations/${location.fileName}`} alt="Location" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: -1,
                userSelect: 'none',
                pointerEvents: 'none'
            }}/>
            <h1 style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                textShadow: '2px 2px 4px #000000',
                userSelect: 'none'

            }}>Cursed Apple Guesser</h1>
            <MapSelection onContinue={onContinue}/>
        </div>
    );
}

//go through 3 rounds of guessing, with random locations each time
function GameScreen({setState}: { setState: (state: GameState) => void }) {
    const chosenLocations = locations.sort(() => 0.5 - Math.random()).slice(0, rountCount);
//use state for index
    const [index, setIndex] = React.useState(0);
    const [showingScore, setShowingScore] = React.useState(false);
    const [guessedLocation, setGuessedLocation] = React.useState<{ x: number, y: number } | null>(null);
    //const [distances, setDistances] = React.useState<number[]>([]);

    if (showingScore) {
        return <IntermediateScore location={chosenLocations[index].location}
                                  guessedLocation={guessedLocation as { x: number, y: number }}
                                  onComplete={() => {

                                      setShowingScore(false);
                                      setGuessedLocation(null);
                                      setIndex(index + 1);
                                      if (index >= rountCount - 1) {
                                          setState("final_scoring");
                                          return;
                                      }
                                  }}/>;
    }

    return (
        <Screen location={chosenLocations[index]} onContinue={(location) => {
            setGuessedLocation(location);
            setShowingScore(true);
        }}/>
    );
}


export default GameScreen;