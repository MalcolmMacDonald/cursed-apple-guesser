import MapDisplay from '../../../components/map-display';
import { worldToNorm, calculateDistance } from '../../../utils/coordinates';
import { calculateScore } from '../../../utils/scoring';
import type { ScoringProps } from '../../../game-engine/types';
import type { DRGameState } from '../definition';
import { simulatePath } from '../utils';

function DRScoring({ state, onContinue }: ScoringProps<DRGameState>) {
    const round = state.currentRound;
    const pair = state.pairs[round];
    const startFacing = state.startFacings[round];
    const steps = state.allSteps[round];

    const waypoints = simulatePath(pair.start.location, startFacing, steps);
    const endpoint = waypoints[waypoints.length - 1];
    const destination = pair.end.location;
    const startLoc = pair.start.location;

    const distance = calculateDistance(endpoint, destination);
    const score = calculateScore(distance);

    const topbarHeight = 52;
    const imageSize = Math.min(
        window.innerWidth * 0.72,
        (window.innerHeight - topbarHeight) * 0.55
    );

    const isLastRound = round + 1 >= state.totalRounds;

    const startNorm = worldToNorm(startLoc);
    const destNorm = worldToNorm(destination);
    const endNorm = worldToNorm(endpoint);
    const waypointNorms = waypoints.map(worldToNorm);

    const polylinePoints = waypointNorms
        .map((p) => `${p.x * imageSize},${p.y * imageSize}`)
        .join(' ');

    return (
        <div className="intermediate-score">
            <p className="intermediate-score__round">
                Round {round + 1} / {state.totalRounds}
            </p>

            <div className="intermediate-map-wrapper">
                <MapDisplay imageSize={imageSize} onClick={undefined} onMouseMove={undefined} />

                <svg
                    className="pin-line"
                    width={imageSize}
                    height={imageSize}
                    style={{ overflow: 'hidden' }}
                >
                    {waypoints.length > 1 && (
                        <polyline
                            points={polylinePoints}
                            fill="none"
                            stroke="rgba(99, 102, 241, 0.85)"
                            strokeWidth="3"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    )}
                    <line
                        x1={endNorm.x * imageSize}
                        y1={endNorm.y * imageSize}
                        x2={destNorm.x * imageSize}
                        y2={destNorm.y * imageSize}
                        stroke="yellow"
                        strokeWidth="3"
                        strokeDasharray="5,2"
                    />
                </svg>

                <div
                    className="pin pin--start"
                    style={{ left: `${startNorm.x * 100}%`, top: `${startNorm.y * 100}%` }}
                />
                <div
                    className="pin pin--actual"
                    style={{ left: `${destNorm.x * 100}%`, top: `${destNorm.y * 100}%` }}
                />
                <div
                    className="pin pin--guess"
                    style={{ left: `${endNorm.x * 100}%`, top: `${endNorm.y * 100}%` }}
                />
            </div>

            <div className="dr-score-legend">
                <span className="dr-legend-item dr-legend-item--start">◉ Start</span>
                <span className="dr-legend-item dr-legend-item--dest">◉ Destination</span>
                <span className="dr-legend-item dr-legend-item--end">◉ Your endpoint</span>
            </div>

            <div className="intermediate-score__info">
                <p className="intermediate-score__distance">
                    Distance off: {distance.toFixed(0)} units
                </p>
                <p className="intermediate-score__score">
                    {score} <span className="intermediate-score__score-max">/ 1000</span>
                </p>
            </div>

            <button className="intermediate-score__btn" onClick={() => onContinue(score)}>
                {isLastRound ? 'See Final Score' : 'Next Round'}
            </button>
        </div>
    );
}

export default DRScoring;
