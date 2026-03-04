//show map, with "Select location" button that becomes enabled when a location is selected

import React, {useState, useRef} from "react";
import type {MapLocation} from "../../types.ts";
import MapDisplay from "../map-display";

function MapSelection({onSubmit}: { onSubmit: (location: MapLocation) => void }) {
    const [selectedLocation, setSelectedLocation] = useState<{ x: number, y: number } | null>(null);
    const [animPhase, setAnimPhase] = useState<'idle' | 'fixed' | 'centering'>('idle');
    const [fixedStyle, setFixedStyle] = useState<{ centerX: number, centerY: number, width: number } | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const pendingLocationRef = useRef<MapLocation | null>(null);
    const transitionFiredRef = useRef(false);
    const divRef = useRef<HTMLDivElement>(null);

    const mapSize = 10900 * 2;
    const imageSize = isHovered ? 512 * 2 : 512;

    const handleMapClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (animPhase !== 'idle') return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const dist = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);
        if (dist > 0.5) return;
        setSelectedLocation({x, y});
    };

    const handleContinue = () => {
        if (!selectedLocation || animPhase !== 'idle') return;

        const worldLoc: MapLocation = {
            x: (selectedLocation.x - 0.5) * mapSize,
            y: ((1 - selectedLocation.y) - 0.5) * mapSize,
        };
        pendingLocationRef.current = worldLoc;
        transitionFiredRef.current = false;

        const rect = divRef.current!.getBoundingClientRect();
        setFixedStyle({
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2,
            width: rect.width,
        });
        setAnimPhase('fixed');

        // Two rAF: let the 'fixed' style paint, then start the transition
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setAnimPhase('centering');
                // Fallback if transitionEnd never fires
                setTimeout(() => {
                    if (!transitionFiredRef.current) {
                        transitionFiredRef.current = true;
                        onSubmit(pendingLocationRef.current!);
                    }
                }, 600);
            });
        });
    };

    const handleTransitionEnd = () => {
        if (animPhase === 'centering' && !transitionFiredRef.current) {
            transitionFiredRef.current = true;
            onSubmit(pendingLocationRef.current!);
        }
    };

    let dynamicStyle: React.CSSProperties = {};
    if (animPhase === 'fixed' && fixedStyle) {
        dynamicStyle = {
            position: 'fixed',
            left: fixedStyle.centerX,
            top: fixedStyle.centerY,
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            width: fixedStyle.width,
            margin: 0,
            zIndex: 100,
            transition: 'none',
        };
    } else if (animPhase === 'centering' && fixedStyle) {
        dynamicStyle = {
            position: 'fixed',
            left: '50%',
            top: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            width: fixedStyle.width,
            margin: 0,
            zIndex: 100,
            transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1), top 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        };
    }

    return (
        <div
            className="map-selection"
            ref={divRef}
            style={dynamicStyle}
            onTransitionEnd={handleTransitionEnd}
            onMouseEnter={() => {
                if (animPhase === 'idle') setIsHovered(true);
            }}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="map"
                style={{width: imageSize, height: imageSize}}

            >
                <MapDisplay
                    imageSize={imageSize}
                    onClick={handleMapClick}
                    onMouseMove={(e) => {
                        if (e.buttons === 1) handleMapClick(e);
                    }}
                />
                {selectedLocation && (
                    <div
                        className="marker"
                        style={{
                            left: `${selectedLocation.x * 100}%`,
                            top: `${selectedLocation.y * 100}%`,
                        }}
                        title="Selected Location"
                        draggable={false}
                    />
                )}

                <div className="map-faction-label map-faction-label--amber">The Hidden King</div>
                <div className="map-faction-label map-faction-label--sapphire">The Archmother</div>

            </div>
            <button
                className="select-button"
                onClick={handleContinue}
                disabled={!selectedLocation || animPhase !== 'idle'}
            >
                {selectedLocation ? "Continue" : "Click on the map to select a location"}
            </button>
        </div>
    );
}

export default MapSelection;
