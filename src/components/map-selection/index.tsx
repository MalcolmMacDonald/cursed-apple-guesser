//show map, with "Select location" button that becomes enabled when a location is selected

import React, {useState} from "react";
import './map-selection.css';
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
    const pinSize = 10;


    const imageSize = 512; // Assuming a square image for simplicity

    return (
        <div className="map-selection">
            <button
                className="select-button"
                onClick={handleSelectLocation}
                disabled={!selectedLocation}
            >
                {selectedLocation ? "Continue" : "Click on the map to select a location"}
            </button>

            <div className="map" style={{ width: imageSize, height: imageSize }}>
                <MapDisplay
                    imageSize={imageSize}
                    onClick={handleMapClick}
                    onMouseMove={(e) => {
                        if (e.buttons === 1) {
                            handleMapClick(e);
                        }
                    }}
                />
                {selectedLocation && (
                    <div
                        className="marker"
                        style={{
                            left: `${selectedLocation.x * 100}%`,
                            top: `${selectedLocation.y * 100}%`,
                        }}
                        title="Selected Location"
                        draggable={false}
                    />
                )}
                <div className="map-faction-label map-faction-label--amber">Amber Hand</div>
                <div className="map-faction-label map-faction-label--sapphire">Sapphire Flame</div>
            </div>
        </div>
    );

}

export default MapSelection;