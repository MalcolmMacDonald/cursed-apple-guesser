import MapImage from "../../assets/IMG_6117.png";

function MapDisplay({imageSize, onClick, onMouseMove}) {
    return (
        <img
            src={MapImage}
            alt="World Map"
            className="map-image"
            draggable={false}
            onClick={onClick}
            onMouseMove={onMouseMove}
            style={{ width: imageSize, height: imageSize }}
        />
    );
}

export default MapDisplay;