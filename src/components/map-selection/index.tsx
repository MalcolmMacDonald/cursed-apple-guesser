//show map, with "Select location" button that becomes enabled when a location is selected

import React, {useState, useRef} from "react";
import {flushSync} from "react-dom";
import type {MapLocation} from "../../types.ts";
import MapDisplay from "../map-display";

function MapSelection({onSubmit}: { onSubmit: (location: MapLocation) => void }) {
    const [selectedLocation, setSelectedLocation] = useState<{ x: number, y: number } | null>(null);
    const [animPhase, setAnimPhase] = useState<'idle' | 'fixed' | 'centering'>('idle');
    const [fixedStyle, setFixedStyle] = useState<{ centerX: number, centerY: number, width: number, imageSize: number } | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const pendingLocationRef = useRef<MapLocation | null>(null);
    const transitionFiredRef = useRef(false);
    const divRef = useRef<HTMLDivElement>(null);

    const mapSize = 10900 * 2;
    const baseSize = Math.min(window.innerWidth * 0.45, 512);
    const liveImageSize = isHovered ? Math.min(window.innerWidth * 0.85, 1024) : baseSize;
    // Lock image size during animation so hover changes don't shift things mid-flight
    const imageSize = (animPhase !== 'idle' && fixedStyle) ? fixedStyle.imageSize : liveImageSize;

    const handleMapClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (animPhase !== 'idle') return;
        const rect = event.currentTarget.getBoundingClientRect();
        const rawX = (event.clientX - rect.left) / rect.width;
        const rawY = (event.clientY - rect.top) / rect.height;
        // When flipped 180°, invert both axes to get correct map coords
        const x = isFlipped ? 1 - rawX : rawX;
        const y = isFlipped ? 1 - rawY : rawY;
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
        const currentImageSize = liveImageSize;

        // flushSync forces React to commit the 'fixed' state to the DOM synchronously,
        // giving the browser a painted starting frame for the CSS transition.
        flushSync(() => {
            setFixedStyle({
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2,
                width: rect.width,
                imageSize: currentImageSize,
            });
            setAnimPhase('fixed');
            setIsHovered(false);
        });

        // Safety timeout: fires if rAF is suppressed (background/headless tab)
        const safetyId = setTimeout(() => {
            if (!transitionFiredRef.current) {
                transitionFiredRef.current = true;
                onSubmit(pendingLocationRef.current!);
            }
        }, 700);

        requestAnimationFrame(() => {
            clearTimeout(safetyId);
            setAnimPhase('centering');
            // Fallback if transitionend never fires
            setTimeout(() => {
                if (!transitionFiredRef.current) {
                    transitionFiredRef.current = true;
                    onSubmit(pendingLocationRef.current!);
                }
            }, 600);
        });
    };

    const handleTransitionEnd = () => {
        if (animPhase === 'centering' && !transitionFiredRef.current) {
            transitionFiredRef.current = true;
            onSubmit(pendingLocationRef.current!);
        }
    };

    // On mobile, scale the map up to fill the viewport width during the centering animation.
    const isMobile = window.innerWidth <= 600;
    const centeredScale = (isMobile && fixedStyle)
        ? window.innerWidth / fixedStyle.width
        : 1;

    let dynamicStyle: React.CSSProperties = {};
    if (animPhase === 'fixed' && fixedStyle) {
        dynamicStyle = {
            position: 'fixed',
            left: fixedStyle.centerX,
            top: fixedStyle.centerY,
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%) scale(1)',
            transformOrigin: 'center center',
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
            transform: `translate(-50%, -50%) scale(${centeredScale})`,
            transformOrigin: 'center center',
            width: fixedStyle.width,
            margin: 0,
            zIndex: 100,
            transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1), top 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
                style={{
                    width: imageSize,
                    height: imageSize,
                    transform: isFlipped ? 'rotate(180deg)' : undefined,
                }}
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

                <div
                    className="map-faction-label map-faction-label--amber"
                    style={isFlipped ? {transform: 'rotate(180deg)'} : undefined}
                >The Hidden King</div>
                <div
                    className="map-faction-label map-faction-label--sapphire"
                    style={isFlipped ? {transform: 'rotate(180deg)'} : undefined}
                >The Archmother</div>

            </div>
            <div className="map-selection__controls" style={animPhase !== 'idle' ? {visibility: 'hidden'} : undefined}>
                <button
                    className="map-flip-btn"
                    onClick={() => setIsFlipped(f => !f)}
                    disabled={animPhase !== 'idle'}
                    title="View from opposing team's perspective"
                >
                    {isFlipped ? '↺ Normal' : '↺ Flip'}
                </button>
                <button
                    className="select-button"
                    onClick={handleContinue}
                    disabled={!selectedLocation || animPhase !== 'idle'}
                >
                    {selectedLocation ? "Continue" : "Select a location"}
                </button>
            </div>
        </div>
    );
}

export default MapSelection;
