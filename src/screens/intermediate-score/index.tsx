import type {GameData, GameScreenName, MapLocation} from "../../types.ts";

function IntermediateScore({setState, gameData, setGameData}:
                           {
                               setState: (state: GameScreenName) => void,
                               gameData: GameData,
                               setGameData: (gameData: GameData) => void
                           }
) {

    function calculateDistance(
        loc1: MapLocation,
        loc2: MapLocation
    ) {
        const dx = loc2.x - loc1.x;
        const dy = loc2.y - loc1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    const mapRadius = 10900;
    const maxScore = 1000;
    const maxDistance = (mapRadius); // Maximum possible distance on the map

    const location = gameData.locations[gameData.currentRound].location;
    const guessedLocation = gameData.guesses[gameData.currentRound];
    const distance = calculateDistance(location, guessedLocation);
    const score = Math.max(Math.round((1 - (distance / maxDistance)) * maxScore), 0);

    return (
        <div>
            <h1>Intermediate Score</h1>
            <p>Actual Location: {`(${location.x}, ${location.y})`}</p>
            <p>Guessed Location: {`(${guessedLocation.x}, ${guessedLocation.y})`}</p>
            <p>Distance: {calculateDistance(location, guessedLocation).toFixed(2)} units</p>
            <p>Score for this round: {score}/{maxScore}</p>
            <button onClick={() => {
                setGameData({
                    ...gameData,
                    scores: [...gameData.scores, score],
                    currentRound: gameData.currentRound + 1
                });
                if (gameData.currentRound + 1 >= gameData.totalRounds) {
                    setState('final_scoring');
                } else {

                    setState('game');
                }
            }}>{gameData.currentRound + 1 >= gameData.totalRounds ? 'See Final Score' : 'Continue to Next Round'}
            </button>
        </div>
    );

}

export default IntermediateScore;