import './map-display.css';
import MapImage from "../../assets/Map_Base_HiddenKing.png";
import GameplayElements from "../../assets/Map_Overlay_GameplayElements.png";
import UndergroundOverlay from "../../assets/Map_Overlay_Underground.png";
import LinesOverlay from "../../assets/Map_Overlay_Lines.png";

function MapDisplay({imageSize, isFlipped, showUnderground}: {
    imageSize: number;
    isFlipped: boolean;
    showUnderground: boolean;
}) {
    const flipClass = isFlipped ? ' map-image--flipped' : '';
    return (
        <div
            className="map-display"
            style={{width: imageSize, height: imageSize}}
        >
            <img
                src={MapImage}
                alt="World Map"
                className={`map-image${flipClass}`}
                draggable={false}
            />
            <img
                src={LinesOverlay}
                alt="World Map Lines Overlay"
                className={`map-image${flipClass}`}
                draggable={false}
            />
            {!showUnderground && (
                <img
                    src={GameplayElements}
                    className="map-image"
                    draggable={false}
                    alt="Gameplay Elements Overlay"
                />
            )}
            {showUnderground && (
                <img
                    src={UndergroundOverlay}
                    className="map-image"
                    draggable={false}
                    alt="Underground Overlay"
                />
            )}
        </div>
    );
}

export default MapDisplay;
