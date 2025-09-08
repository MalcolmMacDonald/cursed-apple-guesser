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
    const pinSize = 16;


    const actualStyle = {
        width: `${pinSize}px`,
        height: `${pinSize}px`,
        backgroundColor: 'white',
        borderRadius: '50%',
        position: "absolute",
        transform: 'translate(-50%, -50%)',
        left: `${actualLocation.x * 100}%`,
        top: `${actualLocation.y * 100}%`,
        pointerEvents: 'none',
        zIndex: 1,
    };

    const guessStyle = {
        width: ` ${pinSize}px`,
        height: `${pinSize}px`,
        backgroundColor: 'red',
        borderRadius: '50%',
        position: "absolute",
        transform: 'translate(-50%, -50%)',
        left: `${guessLocation.x * 100}%`,
        top: `${guessLocation.y * 100}%`,
        pointerEvents: 'none',
        zIndex: 1,
    };

    const imageSizeInPixels = typeof imageSize === 'string' && imageSize.endsWith('vw') ?
        window.innerWidth * parseFloat(imageSize) / 100 :
        parseFloat(imageSize);

    //draw a line between the two points using svg
    return (
        <>
            <div style={actualStyle}></div>
            <div style={guessStyle}></div>
            <svg style={{position: 'absolute', top: 0, left: 0, pointerEvents: 'none'}} width={imageSize}
                 height={imageSize}>
                <line x1={actualLocation.x * imageSizeInPixels} y1={actualLocation.y * imageSizeInPixels}
                      x2={guessLocation.x * imageSizeInPixels} y2={guessLocation.y * imageSizeInPixels} stroke="yellow"
                      strokeWidth="4"
                      strokeDasharray={"5,2"}
                />
            </svg>
        </>
    );
}

export default GuessLocation;