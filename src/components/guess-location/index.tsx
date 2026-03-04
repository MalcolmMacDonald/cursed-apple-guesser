import type {MapLocation} from "../../types.ts";

function toNormalized(loc: MapLocation) {
    const mapSize = 10900 * 2;
    return {
        x: (loc.x + mapSize / 2) / mapSize,
        y: 1 - (loc.y + mapSize / 2) / mapSize, // Invert Y axis
    };
}

function GuessLocation({actualLocation, guessLocation, mirrorLocation, usedMirror, imageSize}: {
    actualLocation: MapLocation,
    guessLocation: MapLocation,
    mirrorLocation: MapLocation,
    usedMirror: boolean,
    imageSize: number,
}) {
    const actual = toNormalized(actualLocation);
    const guess = toNormalized(guessLocation);
    const mirror = toNormalized(mirrorLocation);

    // Score line goes from guess to whichever location was used for scoring
    const scoreTo = usedMirror ? mirror : actual;

    return (
        <>
            <svg className="pin-line" width={imageSize} height={imageSize}>
                {/* Mirror illustration: only shown when mirror was closer */}
                {usedMirror && (
                    <>
                        {/* Axis line between actual and mirror */}
                        <line
                            x1={actual.x * imageSize} y1={actual.y * imageSize}
                            x2={mirror.x * imageSize} y2={mirror.y * imageSize}
                            stroke="rgba(255,255,255,0.25)"
                            strokeWidth="1.5"
                            strokeDasharray="4,4"
                        />
                        {/* Small center-of-rotation marker */}
                        <circle
                            cx={0.5 * imageSize} cy={0.5 * imageSize}
                            r="4"
                            fill="none"
                            stroke="rgba(255,255,255,0.35)"
                            strokeWidth="1.5"
                        />
                        <line
                            x1={0.5 * imageSize - 6} y1={0.5 * imageSize}
                            x2={0.5 * imageSize + 6} y2={0.5 * imageSize}
                            stroke="rgba(255,255,255,0.35)"
                            strokeWidth="1.5"
                        />
                        <line
                            x1={0.5 * imageSize} y1={0.5 * imageSize - 6}
                            x2={0.5 * imageSize} y2={0.5 * imageSize + 6}
                            stroke="rgba(255,255,255,0.35)"
                            strokeWidth="1.5"
                        />
                    </>
                )}
                {/* Score line: guess → used target */}
                <line
                    x1={guess.x * imageSize} y1={guess.y * imageSize}
                    x2={scoreTo.x * imageSize} y2={scoreTo.y * imageSize}
                    stroke="yellow"
                    strokeWidth="2"
                    strokeDasharray="2,0.5"
                />
            </svg>

            {/* Mirrored location pin — only shown when mirror was closer */}
            {usedMirror && (
                <div
                    className="pin pin--mirror"
                    style={{left: `${mirror.x * 100}%`, top: `${mirror.y * 100}%`}}
                />
            )}

            {/* Actual location pin */}
            <div
                className="pin pin--actual"
                style={{left: `${actual.x * 100}%`, top: `${actual.y * 100}%`}}
            />

            {/* Guess pin */}
            <div
                className="pin pin--guess"
                style={{left: `${guess.x * 100}%`, top: `${guess.y * 100}%`}}
            />
        </>
    );
}

export default GuessLocation;
