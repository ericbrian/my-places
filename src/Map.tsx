import { useState, useRef, useCallback, useMemo } from "react";
import DOMPurify from "dompurify";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import type { ViewStateChangeEvent, MapRef } from "react-map-gl/mapbox";
import Supercluster from "supercluster";
import type { BBox } from "geojson";

import "mapbox-gl/dist/mapbox-gl.css";
import { mapboxAccessToken, siteTitle } from "./siteconfig";
import geoJson from "./geojson";

// Pin color & emoji mapping by placeType
const PIN_CONFIG: Record<string, { color: string; emoji: string; shadow: string }> = {
    Home: { color: "#4CAF50", emoji: "🏠", shadow: "rgba(76, 175, 80, 0.4)" },
    Work: { color: "#2196F3", emoji: "💼", shadow: "rgba(33, 150, 243, 0.4)" },
    Travel: { color: "#E91E63", emoji: "🎉", shadow: "rgba(233, 30, 99, 0.4)" },
    Future: { color: "#FF9800", emoji: "⭐", shadow: "rgba(255, 152, 0, 0.4)" },
};

// Teardrop map pin component
function MapPin({ color, emoji, shadow, size = 40 }: { color: string; emoji: string; shadow: string; size?: number }) {
    return (
        <div
            style={{
                cursor: "pointer",
                transform: "translate(0, -100%)",
                filter: `drop-shadow(0 3px 4px ${shadow})`,
                transition: "transform 0.15s ease, filter 0.15s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translate(0, -100%) scale(1.15)";
                e.currentTarget.style.filter = `drop-shadow(0 5px 8px ${shadow})`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translate(0, -100%)";
                e.currentTarget.style.filter = `drop-shadow(0 3px 4px ${shadow})`;
            }}
        >
            <svg
                width={size}
                height={size * 1.3}
                viewBox="0 0 40 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Teardrop / pin shape */}
                <path
                    d="M20 0C8.954 0 0 8.954 0 20c0 11.046 20 32 20 32s20-20.954 20-32C40 8.954 31.046 0 20 0z"
                    fill={color}
                />
                {/* White inner circle */}
                <circle cx="20" cy="19" r="13" fill="white" opacity="0.95" />
            </svg>
            {/* Emoji centered in the white circle */}
            <span
                style={{
                    position: "absolute",
                    top: `${size * 0.22}px`,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: `${size * 0.4}px`,
                    lineHeight: "1",
                    pointerEvents: "none",
                }}
            >
                {emoji}
            </span>
        </div>
    );
}

function MapComponent() {
    const mapRef = useRef<MapRef>(null);

    // Calculate bounding box from GeoJSON data
    const calculateBounds = () => {
        const coordinates = geoJson.features.map((feature) => feature.geometry.coordinates);
        const lngs = coordinates.map((coord) => coord[0]);
        const lats = coordinates.map((coord) => coord[1]);

        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        // Add some buffer around the bounds for max bounds
        const lngBuffer = (maxLng - minLng) * 0.1;
        const latBuffer = (maxLat - minLat) * 0.1;

        return {
            fitBounds: [
                [minLng, minLat], // Southwest
                [maxLng, maxLat], // Northeast
            ] as [[number, number], [number, number]],
            maxBounds: [
                [minLng - lngBuffer, minLat - latBuffer], // Southwest with buffer
                [maxLng + lngBuffer, maxLat + latBuffer], // Northeast with buffer
            ] as [[number, number], [number, number]],
        };
    };

    const bounds = calculateBounds();

    // Calculate initial viewState from bounds to prevent jumping
    const calculateInitialZoom = () => {
        const lngDiff = bounds.fitBounds[1][0] - bounds.fitBounds[0][0];
        const latDiff = bounds.fitBounds[1][1] - bounds.fitBounds[0][1];
        const maxDiff = Math.max(lngDiff, latDiff);

        // Rough approximation for zoom level based on degree span
        if (maxDiff > 100) return 1;
        if (maxDiff > 50) return 2;
        if (maxDiff > 20) return 3;
        if (maxDiff > 10) return 4;
        if (maxDiff > 5) return 5;
        return 6;
    };

    const initialViewState = {
        longitude: (bounds.fitBounds[0][0] + bounds.fitBounds[1][0]) / 2,
        latitude: (bounds.fitBounds[0][1] + bounds.fitBounds[1][1]) / 2,
        zoom: calculateInitialZoom(),
    };

    const [viewState, setViewState] = useState(initialViewState);

    const [showFutureLocations, setShowFutureLocations] = useState(false);
    const [showHomeLocations, setShowHomeLocations] = useState(true);
    const [showWorkLocations, setShowWorkLocations] = useState(true);
    const [showTravelLocations, setShowTravelLocations] = useState(true);

    const resetMap = () => {
        setViewState(initialViewState);
    };

    const [popupInfo, setPopupInfo] = useState<{
        longitude: number;
        latitude: number;
        place: string;
        description: string;
        placeType: string;
        localname: string | null;
    } | null>(null);

    // Determine which features are visible based on toggle state
    const visibilityMap: Record<string, boolean> = {
        Home: showHomeLocations,
        Work: showWorkLocations,
        Travel: showTravelLocations,
        Future: showFutureLocations,
    };

    // Filter features by visibility toggles
    const visibleFeatures = useMemo(
        () =>
            geoJson.features.filter(
                (f) => f.properties && visibilityMap[f.properties.placeType],
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [showHomeLocations, showWorkLocations, showTravelLocations, showFutureLocations],
    );

    // Build supercluster index from visible features
    const clusterIndex = useMemo(() => {
        const index = new Supercluster<{ place: string; localname: string | null; placeType: string; description: string }>({
            radius: 60,
            maxZoom: 16,
        });
        index.load(
            visibleFeatures.map((f) => ({
                type: "Feature" as const,
                properties: {
                    place: f.properties!.place,
                    localname: f.properties!.localname,
                    placeType: f.properties!.placeType,
                    description: f.properties!.description,
                },
                geometry: f.geometry,
            })),
        );
        return index;
    }, [visibleFeatures]);

    // Get clusters for the current viewport
    const clusters = useMemo(() => {
        const bbox: BBox = [-180, -85, 180, 85];
        if (mapRef.current) {
            const b = mapRef.current.getMap().getBounds();
            if (b) {
                bbox[0] = b.getWest();
                bbox[1] = b.getSouth();
                bbox[2] = b.getEast();
                bbox[3] = b.getNorth();
            }
        }
        return clusterIndex.getClusters(bbox, Math.floor(viewState.zoom));
    }, [clusterIndex, viewState]);

    const onMarkerClick = useCallback(
        (feature: (typeof geoJson.features)[number]) => {
            if (!feature.properties) return;
            const [longitude, latitude] = feature.geometry.coordinates;
            setPopupInfo({
                longitude,
                latitude,
                place: feature.properties.place,
                description: feature.properties.description,
                placeType: feature.properties.placeType,
                localname: feature.properties.localname,
            });
        },
        [],
    );

    const onClusterClick = useCallback(
        (clusterId: number, longitude: number, latitude: number) => {
            const zoom = clusterIndex.getClusterExpansionZoom(clusterId);
            setViewState((prev) => ({
                ...prev,
                longitude,
                latitude,
                zoom: Math.min(zoom, 18),
            }));
        },
        [clusterIndex],
    );

    return (
        <>
            <Map
                ref={mapRef}
                {...viewState}
                mapboxAccessToken={mapboxAccessToken}
                onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
                style={{ width: "100vw", height: "100vh" }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                projection="mercator"
                maxBounds={bounds.maxBounds}
                minZoom={0}
            >
                {/* Render clusters and individual pin markers */}
                {clusters.map((cluster) => {
                    const [lng, lat] = cluster.geometry.coordinates;
                    const props = cluster.properties;

                    // Cluster bubble
                    if ("cluster" in props && props.cluster) {
                        const count = (props as Supercluster.ClusterProperties).point_count;
                        const clusterId = (props as Supercluster.ClusterProperties).cluster_id;
                        // Scale bubble size by point count
                        const size = 36 + Math.min(count, 100) * 0.4;
                        return (
                            <Marker
                                key={`cluster-${clusterId}`}
                                longitude={lng}
                                latitude={lat}
                                anchor="center"
                                onClick={(e) => {
                                    e.originalEvent.stopPropagation();
                                    onClusterClick(clusterId as number, lng, lat);
                                }}
                            >
                                <div
                                    style={{
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                        border: "3px solid white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontWeight: 700,
                                        fontSize: `${Math.max(13, 16 - Math.floor(count / 20))}px`,
                                        fontFamily: "system-ui, -apple-system, sans-serif",
                                        cursor: "pointer",
                                        boxShadow: "0 3px 10px rgba(99, 102, 241, 0.4)",
                                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "scale(1.15)";
                                        e.currentTarget.style.boxShadow = "0 5px 16px rgba(99, 102, 241, 0.5)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                        e.currentTarget.style.boxShadow = "0 3px 10px rgba(99, 102, 241, 0.4)";
                                    }}
                                >
                                    {count}
                                </div>
                            </Marker>
                        );
                    }

                    // Individual point — render teardrop pin
                    const placeType = props.placeType;
                    const config = PIN_CONFIG[placeType];
                    if (!config) return null;

                    return (
                        <Marker
                            key={`point-${lng}-${lat}-${props.place}`}
                            longitude={lng}
                            latitude={lat}
                            anchor="bottom"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                onMarkerClick({
                                    type: "Feature",
                                    properties: props as typeof geoJson.features[number]["properties"],
                                    geometry: cluster.geometry,
                                });
                            }}
                        >
                            <MapPin color={config.color} emoji={config.emoji} shadow={config.shadow} />
                        </Marker>
                    );
                })}
                {popupInfo && (
                    <Popup
                        longitude={popupInfo.longitude}
                        latitude={popupInfo.latitude}
                        onClose={() => setPopupInfo(null)}
                        closeButton={true}
                        closeOnClick={false}
                        className="custom-popup"
                    >
                        <>
                            {/* Header section with gradient background */}
                            <div
                                style={{
                                    background: `linear-gradient(135deg, ${
                                        popupInfo.placeType === "Home"
                                            ? "#4CAF50, #66BB6A"
                                            : popupInfo.placeType === "Work"
                                            ? "#2196F3, #42A5F5"
                                            : popupInfo.placeType === "Travel"
                                            ? "#E91E63, #EC407A"
                                            : "#FF9800, #FFA726"
                                    })`,
                                    padding: "20px",
                                    color: "white",
                                    position: "relative",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div
                                        style={{
                                            fontSize: "24px",
                                            background: "rgba(255, 255, 255, 0.2)",
                                            borderRadius: "50%",
                                            width: "48px",
                                            height: "48px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backdropFilter: "blur(10px)",
                                        }}
                                    >
                                        {popupInfo.placeType === "Home" && "🏠"}
                                        {popupInfo.placeType === "Work" && "💼"}
                                        {popupInfo.placeType === "Travel" && "🎉"}
                                        {popupInfo.placeType === "Future" && "⭐"}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3
                                            style={{
                                                margin: "0 0 4px 0",
                                                fontSize: "18px",
                                                fontWeight: "700",
                                                lineHeight: "1.2",
                                                textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                                            }}
                                        >
                                            {popupInfo.place}
                                        </h3>
                                        {popupInfo.localname && (
                                            <h4
                                                style={{
                                                    margin: "0",
                                                    fontSize: "14px",
                                                    fontWeight: "400",
                                                    fontStyle: "italic",
                                                    opacity: 0.9,
                                                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                                                }}
                                            >
                                                {popupInfo.localname}
                                            </h4>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content section */}
                            <div style={{ padding: "20px" }}>
                                <div
                                    style={{
                                        fontSize: "15px",
                                        lineHeight: "1.6",
                                        color: "#2c3e50",
                                        marginBottom: "20px",
                                    }}
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(popupInfo.description) }}
                                />

                                {/* Type pill */}
                                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            padding: "4px 16px",
                                            backgroundColor:
                                                popupInfo.placeType === "Home"
                                                    ? "rgba(76, 175, 80, 0.1)"
                                                    : popupInfo.placeType === "Work"
                                                    ? "rgba(33, 150, 243, 0.1)"
                                                    : popupInfo.placeType === "Travel"
                                                    ? "rgba(233, 30, 99, 0.1)"
                                                    : "rgba(255, 152, 0, 0.1)",
                                            color:
                                                popupInfo.placeType === "Home"
                                                    ? "#2E7D32"
                                                    : popupInfo.placeType === "Work"
                                                    ? "#1565C0"
                                                    : popupInfo.placeType === "Travel"
                                                    ? "#C2185B"
                                                    : "#E65100",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.8px",
                                            border: `2px solid ${
                                                popupInfo.placeType === "Home"
                                                    ? "rgba(76, 175, 80, 0.2)"
                                                    : popupInfo.placeType === "Work"
                                                    ? "rgba(33, 150, 243, 0.2)"
                                                    : popupInfo.placeType === "Travel"
                                                    ? "rgba(233, 30, 99, 0.2)"
                                                    : "rgba(255, 152, 0, 0.2)"
                                            }`,
                                            transition: "all 0.2s ease-in-out",
                                        }}
                                    >
                                        {popupInfo.placeType}
                                    </span>
                                </div>
                            </div>
                        </>
                    </Popup>
                )}

                {/* Site Title */}
                <div
                    style={{
                        position: "absolute",
                        top: "20px",
                        left: "20px",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        padding: "16px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        zIndex: 1,
                    }}
                >
                    <h1
                        style={{
                            margin: "0",
                            fontSize: "24px",
                            color: "#333",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <span style={{ fontSize: "28px" }}>🗺️</span>
                        {siteTitle}
                    </h1>
                </div>

                {/* Legend */}
                <div
                    style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        padding: "16px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        fontSize: "14px",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        minWidth: "140px",
                        zIndex: 1,
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                padding: "4px",
                                borderRadius: "4px",
                                backgroundColor: showHomeLocations ? "rgba(76, 175, 80, 0.1)" : "transparent",
                                border: showHomeLocations ? "1px solid rgba(76, 175, 80, 0.3)" : "1px solid transparent",
                                minWidth: "160px",
                            }}
                            onClick={() => setShowHomeLocations(!showHomeLocations)}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    backgroundColor: showHomeLocations ? "#4CAF50" : "#ccc",
                                    border: "2px solid white",
                                    fontSize: "12px",
                                    opacity: showHomeLocations ? 1 : 0.5,
                                }}
                            >
                                🏠
                            </div>
                            <span
                                style={{
                                    color: showHomeLocations ? "#4CAF50" : "#999",
                                    fontWeight: showHomeLocations ? "bold" : "normal",
                                    flex: 1,
                                }}
                            >
                                Home ({showHomeLocations ? "hide" : "show"})
                            </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                padding: "4px",
                                borderRadius: "4px",
                                backgroundColor: showWorkLocations ? "rgba(33, 150, 243, 0.1)" : "transparent",
                                border: showWorkLocations ? "1px solid rgba(33, 150, 243, 0.3)" : "1px solid transparent",
                                minWidth: "160px",
                            }}
                            onClick={() => setShowWorkLocations(!showWorkLocations)}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    backgroundColor: showWorkLocations ? "#2196F3" : "#ccc",
                                    border: "2px solid white",
                                    fontSize: "12px",
                                    opacity: showWorkLocations ? 1 : 0.5,
                                }}
                            >
                                💼
                            </div>
                            <span
                                style={{
                                    color: showWorkLocations ? "#2196F3" : "#999",
                                    fontWeight: showWorkLocations ? "bold" : "normal",
                                    flex: 1,
                                }}
                            >
                                Work ({showWorkLocations ? "hide" : "show"})
                            </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                padding: "4px",
                                borderRadius: "4px",
                                backgroundColor: showTravelLocations ? "rgba(233, 30, 99, 0.1)" : "transparent",
                                border: showTravelLocations ? "1px solid rgba(233, 30, 99, 0.3)" : "1px solid transparent",
                                minWidth: "160px",
                            }}
                            onClick={() => setShowTravelLocations(!showTravelLocations)}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    backgroundColor: showTravelLocations ? "#E91E63" : "#ccc",
                                    border: "2px solid white",
                                    fontSize: "12px",
                                    opacity: showTravelLocations ? 1 : 0.5,
                                }}
                            >
                                🎉
                            </div>
                            <span
                                style={{
                                    color: showTravelLocations ? "#E91E63" : "#999",
                                    fontWeight: showTravelLocations ? "bold" : "normal",
                                    flex: 1,
                                }}
                            >
                                Travel ({showTravelLocations ? "hide" : "show"})
                            </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                padding: "4px",
                                borderRadius: "4px",
                                backgroundColor: showFutureLocations ? "rgba(255, 152, 0, 0.1)" : "transparent",
                                border: showFutureLocations ? "1px solid rgba(255, 152, 0, 0.3)" : "1px solid transparent",
                                minWidth: "160px",
                            }}
                            onClick={() => setShowFutureLocations(!showFutureLocations)}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    backgroundColor: showFutureLocations ? "#FF9800" : "#ccc",
                                    border: "2px solid white",
                                    fontSize: "12px",
                                    opacity: showFutureLocations ? 1 : 0.5,
                                }}
                            >
                                ⭐
                            </div>
                            <span
                                style={{
                                    color: showFutureLocations ? "#FF9800" : "#999",
                                    fontWeight: showFutureLocations ? "bold" : "normal",
                                    flex: 1,
                                }}
                            >
                                Future ({showFutureLocations ? "hide" : "show"})
                            </span>
                            {!showFutureLocations && (
                                <span
                                    style={{
                                        fontSize: "10px",
                                        color: "#999",
                                        fontStyle: "italic",
                                        visibility: "hidden",
                                    }}
                                >
                                    (click)
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(0, 0, 0, 0.1)" }}>
                        <button
                            onClick={resetMap}
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#fff",
                                backgroundColor: "#6c757d",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                transition: "all 0.2s ease",
                                fontFamily: "system-ui, -apple-system, sans-serif",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#5a6268";
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#6c757d";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                            }}
                            onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(0) scale(0.98)")}
                            onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-1px) scale(1)")}
                        >
                            🔄 Reset View
                        </button>
                    </div>
                </div>
            </Map>
        </>
    );
}

export default MapComponent;
