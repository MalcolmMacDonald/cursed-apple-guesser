import MapImage from "../../assets/Map_Base_HiddenKing.png";

import GameplayElements from "../../assets/Map_Overlay_GameplayElements.png";
import UndergroundOverlay from "../../assets/Map_Overlay_Underground.png";
import LinesOverlay from "../../assets/Map_Overlay_Lines.png";

function MapDisplay({imageSize, onClick, onMouseMove, isFlipped, showUnderground}) {
    return (
        <div
            style={{
                position: 'relative',
                width: imageSize,
                height: imageSize,
                transition: 'width 0.2s ease, height 0.2s ease',
            }}
        >
            <img
                src={MapImage}
                alt="World Map"
                className="map-image"
                draggable={false}
                onClick={onClick}
                onMouseMove={onMouseMove}
                style={{
                    transform: isFlipped ? 'rotate(180deg)' : undefined,
                }}
            />
            <img src={LinesOverlay}
                 alt="World Map Lines Overlay"
                 className="map-image"
                 draggable={false}
                 style={{
                     transform: isFlipped ? 'rotate(180deg)' : undefined,
                 }}
            />

            {!showUnderground && (

                <img
                    src={GameplayElements}
                    className="map-image"
                    draggable={false}
                    alt="Gameplay Elements Overlay"
                    style={{}}
                />
            )}
            {showUnderground && (
                <img
                    src={UndergroundOverlay}
                    className="map-image"
                    draggable={false}
                    alt={"Underground Overlay"}

                    style={{}}
                />)}
        </div>
    );
}


export default MapDisplay;