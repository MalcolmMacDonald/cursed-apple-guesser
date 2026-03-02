import type {GameData, GameScreenName, MapLocation} from "../../types.ts";
import MapDisplay from "../../components/map-display";
import GuessLocation from "../../components/guess-location";

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
    // Responsive map size: large enough on mobile, capped on desktop
    const imageSize = Math.min(window.innerWidth * 0.85, window.innerHeight * 0.55, 480);
    const isLastRound = gameData.currentRound + 1 >= gameData.totalRounds;

    return (
        <div className="intermediate-score">
            <p className="intermediate-score__round">Round {gameData.currentRound + 1} / {gameData.totalRounds}</p>
            <div className="intermediate-map-wrapper">
                <MapDisplay imageSize={imageSize} onClick={undefined} onMouseMove={undefined}/>
                <GuessLocation actualLocation={location} guessLocation={guessedLocation} imageSize={imageSize}/>
            </div>
            <div className="intermediate-score__info">
                <p className="intermediate-score__distance">Distance: {distance.toFixed(0)} units</p>
                <p className="intermediate-score__score">{score} <span className="intermediate-score__score-max">/ {maxScore}</span></p>
            </div>
            <button className="intermediate-score__btn" onClick={() => {
                setGameData({
                    ...gameData,
                    scores: [...gameData.scores, score],
                    currentRound: gameData.currentRound + 1
                });
                setState(isLastRound ? 'final_scoring' : 'game');
            }}>
                {isLastRound ? 'See Final Score' : 'Next Round'}
            </button>
        </div>
    );

}

export default IntermediateScore;