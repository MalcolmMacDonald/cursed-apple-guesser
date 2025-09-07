function IntermediateScore({location, guessedLocation, onComplete}: {
    location: { x: number, y: number, z: number },
    guessedLocation: { x: number, y: number }
    onComplete: () => void
}) {

    function calculateDistance(loc1: { x: number, y: number, z?: number }, loc2: { x: number, y: number, z?: number }) {
        const dx = loc1.x - loc2.x;
        const dy = loc1.y - loc2.y;
        const dz = (loc1.z ?? 0) - (loc2.z ?? 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    return (
        <div>
            <h1>Intermediate Score</h1>
            <p>Actual Location: {`(${location.x}, ${location.y}, ${location.z})`}</p>
            <p>Guessed Location: {`(${guessedLocation.x}, ${guessedLocation.y})`}</p>
            <p>Distance: {calculateDistance(location, guessedLocation).toFixed(2)} units</p>
            <button onClick={() => {
                onComplete();
            }}>Continue to Next Round
            </button>
        </div>
    );

}

export default IntermediateScore;