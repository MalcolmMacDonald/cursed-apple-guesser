// show map, with "Select location" button that becomes enabled when a location is selected

import './map-selection.css';
import React, {useState, useRef, useEffect, useCallback} from "react";
import {flushSync} from "react-dom";
import type {MapLocation} from "../../types.ts";
import MapDisplay from "../map-display";
import {TOPBAR_HEIGHT} from "../top-bar";
import {MAP_SIZE} from "../../utils/coordinates";

const MAX_ZOOM = 4;

function getMapCoordsRaw(clientX: number, clientY: number, rect: DOMRect, z: number, px: number, py: number, size: number, flipped: boolean) {
    const cx = clientX - rect.left - size / 2;
    const cy = clientY - rect.top - size / 2;
    const contentCx = (cx - px) / z;
    const contentCy = (cy - py) / z;
    const rawX = contentCx / size + 0.5;
    const rawY = contentCy / size + 0.5;
    const x = flipped ? 1 - rawX : rawX;
    const y = flipped ? 1 - rawY : rawY;
    const dist = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);
    return {x, y, dist};
}

function clampPan(px: number, py: number, z: number, size: number) {
    const maxPan = (size * (z - 1)) / 2;
    return {
        x: Math.max(-maxPan, Math.min(maxPan, px)),
        y: Math.max(-maxPan, Math.min(maxPan, py)),
    };
}

function MapSelection({onSubmit}: {
    onSubmit: (location: MapLocation, isFlipped: boolean, showUnderground: boolean) => void
}) {
    const [selectedLocation, setSelectedLocation] = useState<{ x: number, y: number } | null>(null);
    const [animPhase, setAnimPhase] = useState<'idle' | 'fixed' | 'centering'>('idle');
    const [fixedStyle, setFixedStyle] = useState<{
        centerX: number,
        centerY: number,
        width: number,
        imageSize: number
    } | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showUnderground, setShowUnderground] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);

    const pendingLocationRef = useRef<MapLocation | null>(null);
    const transitionFiredRef = useRef(false);
    const divRef = useRef<HTMLDivElement>(null);
    const mapDivRef = useRef<HTMLDivElement>(null);
    const pinchStartRef = useRef<{ dist: number; zoom: number; midX: number; midY: number; panX: number; panY: number } | null>(null);

    // Refs so event handlers always see current values without stale closures
    const zoomRef = useRef(1);
    const panRef = useRef({x: 0, y: 0});
    const isFlippedRef = useRef(false);
    const animPhaseRef = useRef<'idle' | 'fixed' | 'centering'>('idle');
    const imageSizeRef = useRef(0);
    const setLocationRef = useRef(setSelectedLocation);

    zoomRef.current = isHovered ? zoom : 1;
    panRef.current = isHovered ? {x: panX, y: panY} : {x: 0, y: 0};
    isFlippedRef.current = isFlipped;
    animPhaseRef.current = animPhase;
    setLocationRef.current = setSelectedLocation;

    const maxMapSize = Math.min(window.innerWidth, window.innerHeight - TOPBAR_HEIGHT);
    const baseSize = Math.min(window.innerWidth * 0.45, 512);
    const expandedSize = Math.min(maxMapSize * 0.90, 900);
    const liveImageSize = isHovered ? expandedSize : baseSize;
    const imageSize = (animPhase !== 'idle' && fixedStyle) ? fixedStyle.imageSize : liveImageSize;
    imageSizeRef.current = imageSize;

    const placePin = useCallback((clientX: number, clientY: number, rect: DOMRect) => {
        const {x, y, dist} = getMapCoordsRaw(
            clientX, clientY, rect,
            zoomRef.current, panRef.current.x, panRef.current.y,
            imageSizeRef.current, isFlippedRef.current
        );
        if (dist > 0.5) return;
        setLocationRef.current({x, y});
    }, []);

    // Non-passive wheel handler (must be attached via useEffect)
    useEffect(() => {
        const el = mapDivRef.current;
        if (!el) return;

        const handler = (e: WheelEvent) => {
            e.preventDefault();
            if (animPhaseRef.current !== 'idle') return;
            const rect = el.getBoundingClientRect();
            const size = imageSizeRef.current;
            const cx = e.clientX - rect.left - size / 2;
            const cy = e.clientY - rect.top - size / 2;
            const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
            const oldZoom = zoomRef.current;
            const newZoom = Math.max(1, Math.min(MAX_ZOOM, oldZoom * factor));
            const oldPan = panRef.current;
            const newPanX = cx - (cx - oldPan.x) * newZoom / oldZoom;
            const newPanY = cy - (cy - oldPan.y) * newZoom / oldZoom;
            const clamped = clampPan(newPanX, newPanY, newZoom, size);
            zoomRef.current = newZoom;
            panRef.current = {x: clamped.x, y: clamped.y};
            setZoom(newZoom);
            setPanX(clamped.x);
            setPanY(clamped.y);
        };

        el.addEventListener('wheel', handler, {passive: false});
        return () => el.removeEventListener('wheel', handler);
    }, []);

    // Non-passive touchmove handler (prevents page scroll while interacting with map)
    useEffect(() => {
        const el = mapDivRef.current;
        if (!el) return;

        const handler = (e: TouchEvent) => {
            if (e.touches.length === 1 && animPhaseRef.current === 'idle') {
                e.preventDefault();
                const rect = el.getBoundingClientRect();
                const {x, y, dist} = getMapCoordsRaw(
                    e.touches[0].clientX, e.touches[0].clientY, rect,
                    zoomRef.current, panRef.current.x, panRef.current.y,
                    imageSizeRef.current, isFlippedRef.current
                );
                if (dist <= 0.5) setLocationRef.current({x, y});
            } else if (e.touches.length === 2 && pinchStartRef.current) {
                e.preventDefault();
                const rect = el.getBoundingClientRect();
                const size = imageSizeRef.current;
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const newDist = Math.sqrt(dx * dx + dy * dy);
                const newZoom = Math.max(1, Math.min(MAX_ZOOM,
                    pinchStartRef.current.zoom * newDist / pinchStartRef.current.dist
                ));
                // Current midpoint relative to map center
                const curMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left - size / 2;
                const curMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top - size / 2;
                // Initial midpoint and pan at pinch start
                const {midX: initMidX, midY: initMidY, panX: startPanX, panY: startPanY, zoom: startZoom} = pinchStartRef.current;
                // Zoom around the initial pinch midpoint
                const zoomedPanX = initMidX - (initMidX - startPanX) * (newZoom / startZoom);
                const zoomedPanY = initMidY - (initMidY - startPanY) * (newZoom / startZoom);
                // Add translation from midpoint movement
                const newPanX = zoomedPanX + (curMidX - initMidX);
                const newPanY = zoomedPanY + (curMidY - initMidY);
                const clamped = clampPan(newPanX, newPanY, newZoom, size);
                zoomRef.current = newZoom;
                panRef.current = clamped;
                setZoom(newZoom);
                setPanX(clamped.x);
                setPanY(clamped.y);
            }
        };

        el.addEventListener('touchmove', handler, {passive: false});
        return () => el.removeEventListener('touchmove', handler);
    }, [placePin]);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const rect = e.currentTarget.getBoundingClientRect();
            const size = imageSizeRef.current;
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left - size / 2;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top - size / 2;
            pinchStartRef.current = {
                dist: Math.sqrt(dx * dx + dy * dy),
                zoom,
                midX,
                midY,
                panX,
                panY,
            };
        }
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        pinchStartRef.current = null;
        // Single tap (not a drag/pinch) places pin
        if (e.changedTouches.length === 1 && e.touches.length === 0) {
            const rect = e.currentTarget.getBoundingClientRect();
            placePin(e.changedTouches[0].clientX, e.changedTouches[0].clientY, rect);
        }
    };

    const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (animPhase !== 'idle') return;
        placePin(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (animPhase !== 'idle') return;
        const rect = e.currentTarget.getBoundingClientRect();
        // Check if cursor is inside the circular map image (unzoomed boundary)
        const rawX = (e.clientX - rect.left) / rect.width;
        const rawY = (e.clientY - rect.top) / rect.height;
        const inCircle = Math.sqrt((rawX - 0.5) ** 2 + (rawY - 0.5) ** 2) <= 0.5;
        //set cursor style if in circle
        if (inCircle) {
            e.currentTarget.style.cursor = 'crosshair';
        } else {
            e.currentTarget.style.cursor = 'default';
        }
        setIsHovered(true);
        if (e.buttons === 1 && inCircle) {
            placePin(e.clientX, e.clientY, rect);
        }
    };

    const handleContinue = () => {
        if (!selectedLocation || animPhase !== 'idle') return;

        const worldLoc: MapLocation = {
            x: (selectedLocation.x - 0.5) * MAP_SIZE,
            y: ((1 - selectedLocation.y) - 0.5) * MAP_SIZE,
        };
        pendingLocationRef.current = worldLoc;
        transitionFiredRef.current = false;

        const rect = divRef.current!.getBoundingClientRect();
        const currentImageSize = liveImageSize;

        flushSync(() => {
            setFixedStyle({
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2,
                width: rect.width,
                imageSize: currentImageSize,
            });
            setAnimPhase('fixed');
            setPanX(0);
            setPanY(0);
            setZoom(1);
            setIsHovered(false);
        });

        const safetyId = setTimeout(() => {
            if (!transitionFiredRef.current) {
                transitionFiredRef.current = true;
                onSubmit(pendingLocationRef.current!, isFlipped, showUnderground);
            }
        }, 700);

        requestAnimationFrame(() => {
            clearTimeout(safetyId);
            setAnimPhase('centering');
            setTimeout(() => {
                if (!transitionFiredRef.current) {
                    transitionFiredRef.current = true;
                    onSubmit(pendingLocationRef.current!, isFlipped, showUnderground);
                }
            }, 600);
        });
    };

    const handleTransitionEnd = (e: React.TransitionEvent) => {
        // Only fire once — on the 'left' property which always changes
        if (e.propertyName !== 'left') return;
        if (animPhase === 'centering' && !transitionFiredRef.current) {
            transitionFiredRef.current = true;
            onSubmit(pendingLocationRef.current!, isFlipped, showUnderground);
        }
    };

    const isMobile = window.innerWidth <= 600;
    const centeredScale = (isMobile && fixedStyle) ? window.innerWidth / fixedStyle.width : 1;

    let dynamicStyle: React.CSSProperties = {};
    if (animPhase === 'fixed' && fixedStyle) {
        dynamicStyle = {
            position: 'relative',
            left: fixedStyle.centerX,
            top: fixedStyle.centerY,
            right: 'auto',
            bottom: 'auto',
            transform: isFlipped ? 'translate(-50%, -50%) rotate(180deg) scale(1)' : 'translate(-50%, -50%) scale(1)',
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
            transform: isFlipped ? `translate(-50%, -50%) rotate(180deg) scale(${centeredScale})` : `translate(-50%, -50%) scale(${centeredScale})`,
            transformOrigin: 'center center',
            width: fixedStyle.width,
            margin: 0,
            zIndex: 100,
            transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1), top 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        };
    }

    // Emoji counter-scale: keeps visual size constant regardless of zoom
    const emojiSize = Math.round(24 / zoom);

    return (
        <div
            className="map-selection"
            ref={divRef}
            style={dynamicStyle}
            onTransitionEnd={handleTransitionEnd}
            onMouseLeave={() => {
                setIsHovered(false);
                setZoom(1);
                setPanX(0);
                setPanY(0);
            }}
        >
            <div
                className="map"
                ref={mapDivRef}
                style={{width: imageSize, height: imageSize}}
                onClick={handleMapClick}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Zoom + pan layer */}
                <div
                    className="map-zoom-pan"
                    style={{transform: `translate(${panX}px, ${panY}px) scale(${zoom})`}}
                >
                    <MapDisplay
                        imageSize={imageSize}
                        isFlipped={isFlipped}
                        showUnderground={showUnderground}
                    />
                    {/* Marker emoji - outside flip layer to maintain upright rotation */}
                    {selectedLocation && (
                        <div
                            className="marker-emoji"
                            style={{
                                left: `${(isFlipped ? 1 - selectedLocation.x : selectedLocation.x) * 100}%`,
                                top: `${(isFlipped ? 1 - selectedLocation.y : selectedLocation.y) * 100}%`,
                                fontSize: emojiSize,
                            }}
                            draggable={false}
                        >
                            {'\uD83D\uDCCD' /* 📍 */}
                        </div>
                    )}

                </div>

            </div>
            <div className={`map-selection__controls${animPhase !== 'idle' ? ' map-selection__controls--hidden' : ''}`}>
                <button
                    className="map-flip-btn"
                    onClick={() => setIsFlipped(f => !f)}
                    disabled={animPhase !== 'idle'}
                    title="View from opposing team's perspective"
                >
                    {isFlipped ? '\u21BA Normal' : '\u21BA Flip'}
                </button>
                <button
                    className="map-flip-btn"
                    onClick={() => setShowUnderground(u => !u)}
                    disabled={animPhase !== 'idle'}
                    title="Toggle underground view"
                >
                    {showUnderground ? '\u2191 Above Ground' : '\u2193 Underground'}
                </button>
                <button
                    className="select-button"
                    onClick={handleContinue}
                    disabled={!selectedLocation || animPhase !== 'idle'}
                >
                    {selectedLocation ? "Continue" : "Select a location"}
                </button>
            </div>
            {/* Faction label overlay — outside the circular clip, unaffected by zoom/pan */}
            <div
                className="map-faction-labels-overlay"
                style={{
                    width: imageSize,
                    height: imageSize,
                    transform: isFlipped ? 'rotate(180deg)' : undefined,
                }}
            >
                <div className="map-faction-label map-faction-label--amber"
                     style={{
                         transform: isFlipped ? 'rotate(180deg)' : undefined,
                         textAlign: isFlipped ? 'right' : 'left',
                     }}
                >
                    The Hidden King
                </div>
                <div className="map-faction-label map-faction-label--sapphire"
                     style={{
                         transform: isFlipped ? 'rotate(180deg)' : undefined,
                         textAlign: isFlipped ? 'left' : 'right',
                     }}
                >
                    The Archmother
                </div>
            </div>
        </div>
    );
}

export default MapSelection;
