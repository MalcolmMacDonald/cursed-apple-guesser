import MapDisplay from '../../../components/map-display';
import GuessLocation from '../../../components/guess-location';
import {calculateDistance, worldToNorm} from '../../../utils/coordinates';
import {calculateScore} from '../../../utils/scoring';
import type {ScoringProps} from '../../../game-engine/types';
import type {LGGameState} from '../definition';
import type {MapLocation} from '../../../types';

function LGScoring({state, onContinue}: ScoringProps<LGGameState>) {
    const locationData = state.locations[state.currentRound];
    const location = locationData.location;
    const guessedLocation = state.guesses[state.currentRound];
    const mirroredLocation: MapLocation = {x: -location.x, y: -location.y};

    const originalDistance = calculateDistance(location, guessedLocation);
    const mirrorDistance = calculateDistance(mirroredLocation, guessedLocation);

    const originalScore = calculateScore(originalDistance);
    const mirrorScore = Math.max(
        Math.round((1 - mirrorDistance / 10900) * 1000 * state.mirrorMultiplier),
        0
    );

    const usedMirror = mirrorScore > originalScore;
    const score = Math.max(originalScore, mirrorScore);
    const effectiveDistance = usedMirror ? mirrorDistance : originalDistance;

    const topbarHeight = 52;
    const imageSize = Math.min(window.innerWidth * 0.80, (window.innerHeight - topbarHeight) * 0.55);
    const isLastRound = state.currentRound + 1 >= state.totalRounds;

    // Zoom calculation: frame the two scored points with padding
    const actualNorm = worldToNorm(location);
    const scoredNorm = worldToNorm(usedMirror ? mirroredLocation : location);
    const guessNorm = worldToNorm(guessedLocation);

    const PAD = 0.12;
    const minX = Math.max(0, Math.min(actualNorm.x, scoredNorm.x, guessNorm.x) - PAD);
    const maxX = Math.min(1, Math.max(actualNorm.x, scoredNorm.x, guessNorm.x) + PAD);
    const minY = Math.max(0, Math.min(actualNorm.y, scoredNorm.y, guessNorm.y) - PAD);
    const maxY = Math.min(1, Math.max(actualNorm.y, scoredNorm.y, guessNorm.y) + PAD);

    const zoom = Math.min(
        1 / (maxX - minX),
        1 / (maxY - minY),
        5
    );
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const panX = (0.5 - cx) * imageSize;
    const panY = (0.5 - cy) * imageSize;

    return (
        <div className="intermediate-score">
            <img
                src={`locations/${locationData.fileName}`}
                alt="Location"
                className="game-bg"
                draggable={false}
            />
            <div className="scoring-bg-overlay"/>
            <div className="scoring-content">
                <p className="intermediate-score__round">
                    Round {state.currentRound + 1} / {state.totalRounds}
                </p>
                <div
                    className="intermediate-map-wrapper"
                    style={{
                        width: imageSize,
                        height: imageSize,
                        overflow: 'hidden',
                        clipPath: 'circle(50% at 50% 50%)',
                        // Add a border to the map container
                        border: '4px solid rgba(255, 255, 255, 0.8)',
                        borderRadius: '50%',
                        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
                        backgroundColor: '#000', // Fallback background color
                    }}
                >
                    <div style={{
                        width: imageSize,
                        height: imageSize,
                        transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                        transformOrigin: 'center center',
                        position: 'relative',
                        //clip with circle to avoid showing edges when zoomed in

                    }}>
                        <MapDisplay imageSize={imageSize} onClick={undefined} onMouseMove={undefined}/>
                        <GuessLocation
                            actualLocation={location}
                            guessLocation={guessedLocation}
                            mirrorLocation={mirroredLocation}
                            usedMirror={usedMirror}
                            imageSize={imageSize}
                        />
                    </div>
                </div>
                {usedMirror && (
                    <div className="intermediate-score__mirror-banner">
                        Mirror scored — your guess was closer to the opposite side of the map
                    </div>
                )}
                <div className="intermediate-score__info">
                    <p className="intermediate-score__distance">
                        Distance: {effectiveDistance.toFixed(0)} units
                    </p>
                    <p className="intermediate-score__score">
                        {score} <span className="intermediate-score__score-max">/ 1000</span>
                    </p>
                </div>
                <button className="intermediate-score__btn" onClick={() => onContinue(score)}>
                    {isLastRound ? 'See Final Score' : 'Next Round'}
                </button>
            </div>
        </div>
    );
}

export default LGScoring;
