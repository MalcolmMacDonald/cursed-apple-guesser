//show map, with "Select location" button that becomes enabled when a location is selected


import React, {useState} from "react";
import MapImage from "../../assets/IMG_6117.png";
import "../../index.css";
import type {GameData, GameScreenName} from "../../types.ts";
import MapDisplay from "../map-display";

function MapSelection({setState, gameData, setGameData}:
                      {
                          setState: (gameState: GameScreenName) => void,
                          gameData: GameData,
                          setGameData: (gameData: GameData) => void
                      }) {
    const [selectedLocation, setSelectedLocation] = useState<{ x: number, y: number } | null>(null);

    const handleMapClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = event.currentTarget.getBoundingClientRect();

        //get normalized coordinates
        let x = (event.clientX - rect.left) / rect.width;
        let y = (event.clientY - rect.top) / rect.height;
        //clamp to circle
        const centerX = 0.5;
        const centerY = 0.5;
        const dist = Math.sqrt((x - centerX) ** 2 + (y -
            centerY) ** 2);
        if (dist > 0.5) {
            return;
        }
        setSelectedLocation({x, y});
    };
    const mapSize = 10900 * 2;

    const handleSelectLocation = () => {
        if (selectedLocation) {
            selectedLocation.y = 1 - selectedLocation.y; // Invert Y axis
            console.log("Selected location", selectedLocation);
            selectedLocation.x = (selectedLocation.x - 0.5) * mapSize;
            selectedLocation.y = (selectedLocation.y - 0.5) * mapSize;

            setGameData({
                ...gameData,
                guesses: [...gameData.guesses, selectedLocation]
            });
            setState('intermediate_scoring');

        }
    };
    const pinSize = 16;


    const imageSize = 512; // Assuming a square image for simplicity

    return (
        <div className="map-selection" style={{
            right: '1vw',
            bottom: 0,
            position: 'absolute',
        }}>

            <button
                className="select-button"
                onClick={handleSelectLocation}
                disabled={!selectedLocation}
            >
                {selectedLocation ? "Continue" : "Click on the map to select a location"}
            </button>

            <div className="map" style={{position: "relative", width: imageSize, height: imageSize}}>

                <MapDisplay
                    imageSize={imageSize}
                    onClick={handleMapClick}
                    onMouseMove={(e) => {
                        if (e.buttons === 1) {
                            handleMapClick(e);
                        }
                    }}
                    style={{
                        cursor: 'crosshair',
                    }}
                />
                {selectedLocation && (
                    <div
                        className="marker"
                        style={{
                            width: `${pinSize}px`,
                            height: `${pinSize}px`,
                            backgroundColor: 'red',
                            borderRadius: '50%',
                            position: "absolute",
                            transform: 'translate(-50%, -50%)',
                            left: `${selectedLocation.x * 100}%`,
                            top: `${selectedLocation.y * 100}%`,
                            pointerEvents: 'none',
                            zIndex: 1,
                            flex: '0 0 auto',

                        }}
                        title="Selected Location"
                        draggable={false}
                    />
                )}
                <div
                    style={{
                        textAlign: 'left',
                        fontSize: 30,
                        position: 'absolute',
                        bottom: '5%',
                        left: '0vw',
                        color: 'white',
                        textShadow: '2px 2px 4px #000000',
                        userSelect: 'none',
                        zIndex: 2,
                        pointerEvents: 'none'
                    }}>
                    Amber Hand
                </div>
                <div
                    style={{
                        textAlign: 'right',
                        fontSize: 30,
                        position: 'absolute',
                        top: '5%',
                        right: '-0.5vw',
                        color: 'white',
                        textShadow: '2px 2px 4px #000000',
                        userSelect: 'none',
                        zIndex: 2,
                        pointerEvents: 'none'
                    }}>
                    Sapphire Flame
                </div>
            </div>
        </div>
    );

}

export default MapSelection;