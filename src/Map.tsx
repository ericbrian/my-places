import { useState, useRef, useCallback, useMemo } from "react";
import DOMPurify from "dompurify";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import type { ViewStateChangeEvent, MapRef } from "react-map-gl/mapbox";
import Supercluster from "supercluster";
import type { BBox } from "geojson";

import "mapbox-gl/dist/mapbox-gl.css";
import { mapboxAccessToken, siteTitle } from "./siteconfig";
import geoJson from "./geojson";
import { MapMarker } from "./MapMarker";

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
            radius: 18,
            maxZoom: 10,
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

                    // Supercluster cluster bubble
                    if ("cluster" in props && props.cluster) {
                        const count = (props as Supercluster.ClusterProperties).point_count;
                        const clusterId = (props as Supercluster.ClusterProperties).cluster_id;
                        const size = 38 + Math.min(count, 100) * 0.45;

                        // Tiered gradients by cluster count
                        let clusterGradient = "linear-gradient(135deg, #06b6d4, #10b981)";
                        let glowColor = "rgba(6, 182, 212, 0.4)";
                        if (count >= 25) {
                            clusterGradient = "linear-gradient(135deg, #f43f5e, #f59e0b)";
                            glowColor = "rgba(244, 63, 94, 0.5)";
                        } else if (count >= 5) {
                            clusterGradient = "linear-gradient(135deg, #6366f1, #8b5cf6)";
                            glowColor = "rgba(99, 102, 241, 0.5)";
                        }

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
                                        position: "relative",
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        minWidth: `${size}px`,
                                        minHeight: `${size}px`,
                                        aspectRatio: "1 / 1",
                                        boxSizing: "border-box",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        flexShrink: 0,
                                    }}
                                >
                                    {/* Outer Pulse Ring */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: "-4px",
                                            borderRadius: "50%",
                                            background: glowColor,
                                            filter: "blur(6px)",
                                            animation: "markerPulse 2s infinite ease-in-out",
                                            pointerEvents: "none",
                                        }}
                                    />
                                    {/* Cluster Main Bubble */}
                                    <div
                                        style={{
                                            position: "relative",
                                            width: "100%",
                                            height: "100%",
                                            borderRadius: "50%",
                                            boxSizing: "border-box",
                                            background: clusterGradient,
                                            border: "3px solid #ffffff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontWeight: 800,
                                            fontSize: `${Math.max(13, 16 - Math.floor(count / 20))}px`,
                                            fontFamily: "system-ui, -apple-system, sans-serif",
                                            lineHeight: "1",
                                            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.15)",
                                            transition: "transform 0.2s ease, boxShadow 0.2s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "scale(1.15)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "scale(1)";
                                        }}
                                    >
                                        {count}
                                    </div>
                                </div>
                            </Marker>
                        );
                    }

                    // Individual point marker
                    const placeType = props.placeType;
                    if (!placeType) return null;

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
                            <MapMarker
                                place={props.place}
                                localname={props.localname}
                                placeType={placeType}
                                isSelected={popupInfo?.place === props.place}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkerClick({
                                        type: "Feature",
                                        properties: props as typeof geoJson.features[number]["properties"],
                                        geometry: cluster.geometry,
                                    });
                                }}
                            />
                        </Marker>
                    );
                })}

                {/* Selected Point Popup */}
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
                            {/* Header section with category gradient background */}
                            <div
                                style={{
                                    background: `linear-gradient(135deg, ${
                                        popupInfo.placeType === "Home"
                                            ? "#10b981, #059669"
                                            : popupInfo.placeType === "Work"
                                            ? "#3b82f6, #1d4ed8"
                                            : popupInfo.placeType === "Travel"
                                            ? "#ec4899, #be185d"
                                            : "#f59e0b, #d97706"
                                    })`,
                                    padding: "20px",
                                    color: "white",
                                    position: "relative",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                    <div
                                        style={{
                                            fontSize: "24px",
                                            background: "rgba(255, 255, 255, 0.25)",
                                            borderRadius: "50%",
                                            width: "48px",
                                            height: "48px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backdropFilter: "blur(10px)",
                                            WebkitBackdropFilter: "blur(10px)",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                        }}
                                    >
                                        {popupInfo.placeType === "Home" && "🏠"}
                                        {popupInfo.placeType === "Work" && "💼"}
                                        {popupInfo.placeType === "Travel" && "✈"}
                                        {popupInfo.placeType === "Future" && "🌟"}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3
                                            style={{
                                                margin: "0 0 4px 0",
                                                fontSize: "18px",
                                                fontWeight: "700",
                                                lineHeight: "1.25",
                                                textShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
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
                                                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                                                }}
                                            >
                                                {popupInfo.localname}
                                            </h4>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content section */}
                            <div style={{ padding: "20px", background: "#ffffff" }}>
                                <div
                                    style={{
                                        fontSize: "14px",
                                        lineHeight: "1.6",
                                        color: "#334155",
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
                                            padding: "4px 14px",
                                            backgroundColor:
                                                popupInfo.placeType === "Home"
                                                    ? "rgba(16, 185, 129, 0.12)"
                                                    : popupInfo.placeType === "Work"
                                                    ? "rgba(59, 130, 246, 0.12)"
                                                    : popupInfo.placeType === "Travel"
                                                    ? "rgba(236, 72, 153, 0.12)"
                                                    : "rgba(245, 158, 11, 0.12)",
                                            color:
                                                popupInfo.placeType === "Home"
                                                    ? "#047857"
                                                    : popupInfo.placeType === "Work"
                                                    ? "#1d4ed8"
                                                    : popupInfo.placeType === "Travel"
                                                    ? "#be185d"
                                                    : "#b45309",
                                            borderRadius: "20px",
                                            fontSize: "11px",
                                            fontWeight: "700",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.8px",
                                            border: `1.5px solid ${
                                                popupInfo.placeType === "Home"
                                                    ? "rgba(16, 185, 129, 0.3)"
                                                    : popupInfo.placeType === "Work"
                                                    ? "rgba(59, 130, 246, 0.3)"
                                                    : popupInfo.placeType === "Travel"
                                                    ? "rgba(236, 72, 153, 0.3)"
                                                    : "rgba(245, 158, 11, 0.3)"
                                            }`,
                                        }}
                                    >
                                        {popupInfo.placeType}
                                    </span>
                                </div>
                            </div>
                        </>
                    </Popup>
                )}

                {/* Site Title Header */}
                <div
                    className="glass-panel"
                    style={{
                        position: "absolute",
                        top: "20px",
                        left: "20px",
                        padding: "14px 20px",
                        borderRadius: "14px",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        zIndex: 10,
                    }}
                >
                    <h1
                        style={{
                            margin: "0",
                            fontSize: "22px",
                            color: "#0f172a",
                            fontWeight: "800",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            letterSpacing: "-0.3px",
                        }}
                    >
                        <span style={{ fontSize: "26px" }}>🗺️</span>
                        {siteTitle}
                    </h1>
                </div>

                {/* Controls & Legend Panel */}
                <div
                    className="glass-panel"
                    style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        padding: "18px",
                        borderRadius: "16px",
                        fontSize: "13px",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        width: "200px",
                        zIndex: 10,
                    }}
                >
                    {/* Category Filter Toggles */}
                    <div>
                        <div
                            style={{
                                fontSize: "11px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                color: "#64748b",
                                marginBottom: "10px",
                            }}
                        >
                            Categories
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {[
                                { key: "Home", label: "Home", active: showHomeLocations, toggle: () => setShowHomeLocations(!showHomeLocations), color: "#10b981", icon: "🏠" },
                                { key: "Work", label: "Work", active: showWorkLocations, toggle: () => setShowWorkLocations(!showWorkLocations), color: "#3b82f6", icon: "💼" },
                                { key: "Travel", label: "Travel", active: showTravelLocations, toggle: () => setShowTravelLocations(!showTravelLocations), color: "#ec4899", icon: "✈" },
                                { key: "Future", label: "Future", active: showFutureLocations, toggle: () => setShowFutureLocations(!showFutureLocations), color: "#f59e0b", icon: "🌟" },
                            ].map((cat) => (
                                <div
                                    key={cat.key}
                                    onClick={cat.toggle}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        cursor: "pointer",
                                        padding: "6px 8px",
                                        borderRadius: "8px",
                                        backgroundColor: cat.active ? "rgba(255, 255, 255, 0.8)" : "transparent",
                                        border: cat.active ? `1px solid ${cat.color}40` : "1px solid transparent",
                                        transition: "all 0.15s ease",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "22px",
                                            height: "22px",
                                            borderRadius: "50%",
                                            backgroundColor: cat.active ? cat.color : "#cbd5e1",
                                            color: "#fff",
                                            fontSize: "11px",
                                            boxShadow: cat.active ? `0 2px 6px ${cat.color}40` : "none",
                                            opacity: cat.active ? 1 : 0.6,
                                        }}
                                    >
                                        {cat.icon}
                                    </div>
                                    <span
                                        style={{
                                            color: cat.active ? "#1e293b" : "#94a3b8",
                                            fontWeight: cat.active ? 600 : 400,
                                            flex: 1,
                                        }}
                                    >
                                        {cat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(226, 232, 240, 0.8)" }}>
                        <button
                            onClick={resetMap}
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#475569",
                                backgroundColor: "rgba(241, 245, 249, 0.9)",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                fontFamily: "system-ui, -apple-system, sans-serif",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#e2e8f0";
                                e.currentTarget.style.color = "#0f172a";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(241, 245, 249, 0.9)";
                                e.currentTarget.style.color = "#475569";
                            }}
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
