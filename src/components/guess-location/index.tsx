function GuessLocation({actualLocation, guessLocation, imageSize}) {
    const mapSize = 10900 * 2;
    // Convert actualLocation and guessLocation from map coordinates to [0,1] range
    actualLocation = {
        x: (actualLocation.x + mapSize / 2) / mapSize,
        y: 1 - (actualLocation.y + mapSize / 2) / mapSize, // Invert Y axis
    };
    guessLocation = {
        x: (guessLocation.x + mapSize / 2) / mapSize,
        y: 1 - (guessLocation.y + mapSize / 2) / mapSize, // Invert Y axis
    };

    //draw a line between the two points using svg
    return (
        <>
            <div
                className="pin pin--actual"
                style={{ left: `${actualLocation.x * 100}%`, top: `${actualLocation.y * 100}%` }}
            />
            <div
                className="pin pin--guess"
                style={{ left: `${guessLocation.x * 100}%`, top: `${guessLocation.y * 100}%` }}
            />
            <svg className="pin-line" width={imageSize} height={imageSize}>
                <line
                    x1={actualLocation.x * imageSize} y1={actualLocation.y * imageSize}
                    x2={guessLocation.x * imageSize} y2={guessLocation.y * imageSize}
                    stroke="yellow"
                    strokeWidth="4"
                    strokeDasharray="5,2"
                />
            </svg>
        </>
    );
}

export default GuessLocation;