import MapDisplay from '../../../components/map-display';
import GuessLocation from '../../../components/guess-location';
import {calculateDistance, worldToNorm, MAP_RADIUS, MAP_SIZE} from '../../../utils/coordinates';
import {TOPBAR_HEIGHT} from '../../../components/top-bar';
import {calculateTierScore, SCORE_TIERS} from '../../../utils/scoring';
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

    const originalScore = calculateTierScore(originalDistance);
    const rawMirrorScore = calculateTierScore(mirrorDistance);
    const mirrorScore = Math.max(rawMirrorScore - 2, 0);

    const usedMirror = rawMirrorScore > originalScore;
    const score = usedMirror ? mirrorScore : originalScore;
    const maxScore = usedMirror ? 3 : 5;
    const effectiveDistance = usedMirror ? mirrorDistance : originalDistance;

    const scoreColor = SCORE_TIERS.find(t => t.score === score)?.color ?? '#9E9E9E';

    const wasFlipped = state.flips[state.currentRound] ?? false;
    const wasUnderground = state.undergrounds[state.currentRound] ?? false;

    const imageSize = Math.min(window.innerWidth * 0.80, (window.innerHeight - TOPBAR_HEIGHT) * 0.55);
    const isLastRound = state.currentRound + 1 >= state.totalRounds;

    // Zoom calculation: frame the two scored points with padding
    // When the map is flipped, visual positions are (1-x, 1-y) so use those for pan/zoom framing
    const flip = (n: { x: number, y: number }) => wasFlipped ? {x: 1 - n.x, y: 1 - n.y} : n;
    // Raw (pre-flip) normalized coords — used for positions inside the rotated content div
    const rawScoredNorm = worldToNorm(usedMirror ? mirroredLocation : location);
    // Visual (post-flip) normalized coords — used for zoom/pan framing outside the rotated div
    const actualNorm = flip(worldToNorm(location));
    const scoredNorm = flip(rawScoredNorm);
    const guessNorm = flip(worldToNorm(guessedLocation));

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

    // Isoline circles: positioned in visual (post-flip) coordinate space
    const isolineOriginX = scoredNorm.x * imageSize;
    const isolineOriginY = scoredNorm.y * imageSize;

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
                        border: '4px solid rgba(255, 255, 255, 0.8)',
                        borderRadius: '50%',
                        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
                        backgroundColor: '#000',
                    }}
                >
                    <div style={{
                        width: imageSize,
                        height: imageSize,
                        transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                        transformOrigin: 'center center',
                        position: 'relative',
                    }}>
                        <MapDisplay imageSize={imageSize} isFlipped={wasFlipped} showUnderground={wasUnderground}/>
                        {/* Isoline score circles */}
                        <svg
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: imageSize,
                                height: imageSize,
                                pointerEvents: 'none',
                                overflow: 'visible',
                                zIndex: 2,
                            }}
                        >
                            {[...SCORE_TIERS].reverse().map((tier) => {
                                const r = (tier.maxDistance / MAP_SIZE) * imageSize;
                                return (
                                    <circle
                                        key={tier.score}
                                        cx={isolineOriginX}
                                        cy={isolineOriginY}
                                        r={r}
                                        fill="none"
                                        stroke={tier.color}
                                        strokeWidth={1.5}
                                        strokeDasharray="5 4"
                                        opacity={0.65}
                                    />
                                );
                            })}
                        </svg>
                        <GuessLocation
                            actualLocation={location}
                            guessLocation={guessedLocation}
                            mirrorLocation={mirroredLocation}
                            usedMirror={usedMirror}
                            imageSize={imageSize}
                            zoom={zoom}
                            isFlipped={wasFlipped}
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
                    {usedMirror ? (
                        <p className="intermediate-score__score" style={{color: scoreColor}}>
                            <span style={{textDecoration: 'line-through', opacity: 0.6, color: '#fff'}}>
                                {rawMirrorScore}
                            </span>
                            {' → '}
                            {score} <span className="intermediate-score__score-max">/{maxScore}</span>
                        </p>
                    ) : (
                        <p className="intermediate-score__score" style={{color: scoreColor}}>
                            {score} <span className="intermediate-score__score-max">/{maxScore}</span>
                        </p>
                    )}
                </div>
                <button className="intermediate-score__btn" onClick={() => onContinue({score, maxScore})}>
                    {isLastRound ? 'See Final Score' : 'Next Round'}
                </button>
            </div>
        </div>
    );
}

export default LGScoring;
