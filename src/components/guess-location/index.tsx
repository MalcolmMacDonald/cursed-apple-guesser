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

    // Center of map in normalized coords (always 0.5, 0.5)
    const center = { x: 0.5, y: 0.5 };

    // Score line goes from guess to whichever location was used for scoring
    const scoreTo = usedMirror ? mirror : actual;

    return (
        <>
            {/* Mirror illustration: dashed line connecting actual ↔ mirror through the center */}
            <svg className="pin-line" width={imageSize} height={imageSize}>
                {/* Axis line between actual and mirror, showing 180° rotational symmetry */}
                <line
                    x1={actual.x * imageSize} y1={actual.y * imageSize}
                    x2={mirror.x * imageSize} y2={mirror.y * imageSize}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                />
                {/* Small center-of-rotation marker */}
                <circle
                    cx={center.x * imageSize} cy={center.y * imageSize}
                    r="4"
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="1.5"
                />
                <line
                    x1={center.x * imageSize - 6} y1={center.y * imageSize}
                    x2={center.x * imageSize + 6} y2={center.y * imageSize}
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="1.5"
                />
                <line
                    x1={center.x * imageSize} y1={center.y * imageSize - 6}
                    x2={center.x * imageSize} y2={center.y * imageSize + 6}
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="1.5"
                />
                {/* Score line: guess → used target */}
                <line
                    x1={guess.x * imageSize} y1={guess.y * imageSize}
                    x2={scoreTo.x * imageSize} y2={scoreTo.y * imageSize}
                    stroke="yellow"
                    strokeWidth="4"
                    strokeDasharray="5,2"
                />
            </svg>

            {/* Mirrored location pin */}
            <div
                className="pin pin--mirror"
                style={{ left: `${mirror.x * 100}%`, top: `${mirror.y * 100}%` }}
            />

            {/* Actual location pin */}
            <div
                className="pin pin--actual"
                style={{ left: `${actual.x * 100}%`, top: `${actual.y * 100}%` }}
            />

            {/* Guess pin */}
            <div
                className="pin pin--guess"
                style={{ left: `${guess.x * 100}%`, top: `${guess.y * 100}%` }}
            />
        </>
    );
}

export default GuessLocation;
