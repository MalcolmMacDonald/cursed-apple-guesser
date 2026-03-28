import './scoring.css';
import MapDisplay from '../../../components/map-display';
import GuessLocation from '../../../components/guess-location';
import {calculateDistance, worldToNorm, MAP_SIZE, toMeters} from '../../../utils/coordinates';
import {TOPBAR_HEIGHT} from '../../../components/top-bar';
import {calculateGolfScore, GOLF_SCORE_INFO} from '../../../utils/scoring';
import type {LGGameState} from '../LocationGuesserFlow';
import type {MapLocation, RoundScore} from '../../../types';

function Scoring({state, onContinue}: {state: LGGameState; onContinue: (score: RoundScore) => void}) {
    const locationData = state.locations[state.currentRound];
    const location = locationData.location;
    const guessedLocation = state.guesses[state.currentRound];
    const mirroredLocation: MapLocation = {x: -location.x, y: -location.y};
    const minRadius = state.minRadius;

    const originalDistance = calculateDistance(location, guessedLocation);
    const mirrorDistance = calculateDistance(mirroredLocation, guessedLocation);

    const {score, usedMirror} = calculateGolfScore(originalDistance, mirrorDistance, minRadius);
    const scoreInfo = GOLF_SCORE_INFO[score];
    const effectiveDistance = usedMirror ? mirrorDistance : originalDistance;

    const wasFlipped = state.flips[state.currentRound] ?? false;
    const wasUnderground = state.undergrounds[state.currentRound] ?? false;

    const imageSize = Math.min(window.innerWidth * 0.80, (window.innerHeight - TOPBAR_HEIGHT) * 0.55);
    const isLastRound = state.currentRound + 1 >= state.totalRounds;

    const flip = (n: { x: number, y: number }) => wasFlipped ? {x: 1 - n.x, y: 1 - n.y} : n;
    const rawScoredNorm = worldToNorm(usedMirror ? mirroredLocation : location);
    const actualNorm = flip(worldToNorm(location));
    const mirrorNorm = flip(worldToNorm(mirroredLocation));
    const scoredNorm = flip(rawScoredNorm);
    const guessNorm = flip(worldToNorm(guessedLocation));

    const PAD = 0.12;
    const minX = Math.max(0, Math.min(actualNorm.x, scoredNorm.x, guessNorm.x) - PAD);
    const maxX = Math.min(1, Math.max(actualNorm.x, scoredNorm.x, guessNorm.x) + PAD);
    const minY = Math.max(0, Math.min(actualNorm.y, scoredNorm.y, guessNorm.y) - PAD);
    const maxY = Math.min(1, Math.max(actualNorm.y, scoredNorm.y, guessNorm.y) + PAD);

    const zoom = Math.min(1 / (maxX - minX), 1 / (maxY - minY), 5);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const panX = (0.5 - cx) * imageSize;
    const panY = (0.5 - cy) * imageSize;

    const radiusPx = (minRadius / MAP_SIZE) * imageSize;

    const actualOriginX = actualNorm.x * imageSize;
    const actualOriginY = actualNorm.y * imageSize;
    const mirrorOriginX = mirrorNorm.x * imageSize;
    const mirrorOriginY = mirrorNorm.y * imageSize;

    return (
        <div className="intermediate-score">
            <img
                src={`/locations/${locationData.fileName}`}
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
                    style={{width: imageSize, height: imageSize}}
                >
                    <div
                        className="intermediate-map-zoom"
                        style={{
                            width: imageSize,
                            height: imageSize,
                            transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                        }}
                    >
                        <MapDisplay imageSize={imageSize} isFlipped={wasFlipped} showUnderground={wasUnderground}/>
                        {/* Scoring radius circles around actual and mirrored locations */}
                        <svg
                            className="intermediate-map-svg"
                            width={imageSize}
                            height={imageSize}
                        >
                            <circle
                                cx={actualOriginX}
                                cy={actualOriginY}
                                r={radiusPx}
                                fill={GOLF_SCORE_INFO[1].color}
                                fillOpacity={0.08}
                                stroke={GOLF_SCORE_INFO[1].color}
                                strokeWidth={1.5}
                                strokeDasharray="5 4"
                                opacity={0.75}
                            />
                            <circle
                                cx={mirrorOriginX}
                                cy={mirrorOriginY}
                                r={radiusPx}
                                fill={GOLF_SCORE_INFO[2].color}
                                fillOpacity={0.08}
                                stroke={GOLF_SCORE_INFO[2].color}
                                strokeWidth={1.5}
                                strokeDasharray="5 4"
                                opacity={0.75}
                            />
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
                        Distance: {toMeters(effectiveDistance).toFixed(1)} m
                    </p>
                    <p className="intermediate-score__score" style={{color: scoreInfo.color}}>
                        {scoreInfo.emoji} {score} <span className="intermediate-score__score-max">/ 3</span>
                    </p>
                </div>
                <button className="intermediate-score__btn" onClick={() => onContinue({score, maxScore: 3})}>
                    {isLastRound ? 'See Final Score' : 'Next Round'}
                </button>
            </div>
        </div>
    );
}

export default Scoring;
