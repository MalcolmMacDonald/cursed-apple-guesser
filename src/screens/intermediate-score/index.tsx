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
    const maxDistance = mapRadius;

    const location = gameData.locations[gameData.currentRound].location;
    const guessedLocation = gameData.guesses[gameData.currentRound];
    const mirroredLocation: MapLocation = { x: -location.x, y: -location.y };

    const originalDistance = calculateDistance(location, guessedLocation);
    const mirrorDistance = calculateDistance(mirroredLocation, guessedLocation);

    const originalScore = Math.max(Math.round((1 - originalDistance / maxDistance) * maxScore), 0);
    const mirrorScore = Math.max(Math.round((1 - mirrorDistance / maxDistance) * maxScore * gameData.mirrorMultiplier), 0);

    const usedMirror = mirrorScore > originalScore;
    const score = Math.max(originalScore, mirrorScore);
    const effectiveDistance = usedMirror ? mirrorDistance : originalDistance;

    // Responsive map size: large enough on mobile, capped on desktop
    const imageSize = Math.min(window.innerWidth * 0.85, window.innerHeight * 0.55, 480);
    const isLastRound = gameData.currentRound + 1 >= gameData.totalRounds;

    return (
        <div className="intermediate-score">
            <p className="intermediate-score__round">Round {gameData.currentRound + 1} / {gameData.totalRounds}</p>
            <div className="intermediate-map-wrapper">
                <MapDisplay imageSize={imageSize} onClick={undefined} onMouseMove={undefined}/>
                <GuessLocation
                    actualLocation={location}
                    guessLocation={guessedLocation}
                    mirrorLocation={mirroredLocation}
                    usedMirror={usedMirror}
                    imageSize={imageSize}
                />
            </div>
            <div className="intermediate-score__info">
                <p className="intermediate-score__distance">
                    Distance: {effectiveDistance.toFixed(0)} units
                    {usedMirror && <span className="intermediate-score__mirror-tag"> (mirror)</span>}
                </p>
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
