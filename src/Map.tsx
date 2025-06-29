import { useState, useRef } from "react";
import Map, { Source, Layer, Popup } from "react-map-gl/mapbox";
import type { ViewStateChangeEvent, LayerProps, MapMouseEvent, MapRef } from "react-map-gl/mapbox";

import "mapbox-gl/dist/mapbox-gl.css";
import { mapboxAccessToken, siteTitle } from "./siteconfig";
import geoJson from "./geojson";

// Circle markers for "Home" places
const homeLayerStyle: LayerProps = {
    id: "home-points",
    type: "circle",
    filter: ["==", ["get", "placeType"], "Home"],
    paint: {
        "circle-radius": 10,
        "circle-color": "#4CAF50", // Green for home
        "circle-stroke-width": 3,
        "circle-stroke-color": "#FFFFFF",
        "circle-opacity": 0.9,
    },
};

// Home symbol layer
const homeSymbolLayerStyle: LayerProps = {
    id: "home-symbols",
    type: "symbol",
    filter: ["==", ["get", "placeType"], "Home"],
    layout: {
        "text-field": "🏠",
        "text-size": 16,
        "text-offset": [0, 0],
        "text-anchor": "center",
    },
};

// Star-like markers for "Future" places
const futureLayerStyle: LayerProps = {
    id: "future-points",
    type: "circle",
    filter: ["==", ["get", "placeType"], "Future"],
    paint: {
        "circle-radius": 8,
        "circle-color": "#FF9800", // Orange for future
        "circle-stroke-width": 2,
        "circle-stroke-color": "#FFFFFF",
        "circle-opacity": 0.9,
    },
};

// Future symbol layer
const futureSymbolLayerStyle: LayerProps = {
    id: "future-symbols",
    type: "symbol",
    filter: ["==", ["get", "placeType"], "Future"],
    layout: {
        "text-field": "⭐",
        "text-size": 12,
        "text-offset": [0, 0],
        "text-anchor": "center",
    },
};

// Square-like markers for "Work" places
const workLayerStyle: LayerProps = {
    id: "work-points",
    type: "circle",
    filter: ["==", ["get", "placeType"], "Work"],
    paint: {
        "circle-radius": 8,
        "circle-color": "#2196F3", // Blue for work
        "circle-stroke-width": 2,
        "circle-stroke-color": "#FFFFFF",
        "circle-opacity": 0.9,
    },
};

// Work symbol layer
const workSymbolLayerStyle: LayerProps = {
    id: "work-symbols",
    type: "symbol",
    filter: ["==", ["get", "placeType"], "Work"],
    layout: {
        "text-field": "💼",
        "text-size": 12,
        "text-offset": [0, 0],
        "text-anchor": "center",
    },
};

// Heart-like markers for "Travel" places
const travelLayerStyle: LayerProps = {
    id: "travel-points",
    type: "circle",
    filter: ["==", ["get", "placeType"], "Travel"],
    paint: {
        "circle-radius": 8,
        "circle-color": "#E91E63", // Pink for Travel
        "circle-stroke-width": 2,
        "circle-stroke-color": "#FFFFFF",
        "circle-opacity": 0.9,
    },
};

// Travel symbol layer
const travelSymbolLayerStyle: LayerProps = {
    id: "travel-symbols",
    type: "symbol",
    filter: ["==", ["get", "placeType"], "Travel"],
    layout: {
        "text-field": "🎉",
        "text-size": 12,
        "text-offset": [0, 0],
        "text-anchor": "center",
    },
};

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

    const onClick = (event: MapMouseEvent) => {
        const feature = event.features?.[0];
        if (feature && feature.geometry.type === "Point" && feature.properties) {
            const [longitude, latitude] = feature.geometry.coordinates as [number, number];
            setPopupInfo({
                longitude,
                latitude,
                place: feature.properties.place,
                description: feature.properties.description,
                placeType: feature.properties.placeType,
                localname: feature.properties.localname,
            });
        }
    };

    const onMouseEnter = () => {
        if (mapRef.current) {
            mapRef.current.getCanvas().style.cursor = "pointer";
        }
    };

    const onMouseLeave = () => {
        if (mapRef.current) {
            mapRef.current.getCanvas().style.cursor = "";
        }
    };

    return (
        <>
            <Map
                ref={mapRef}
                {...viewState}
                mapboxAccessToken={mapboxAccessToken}
                onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                style={{ width: "100vw", height: "100vh" }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                projection="mercator"
                maxBounds={bounds.maxBounds}
                minZoom={0}
                interactiveLayerIds={[
                    ...(showHomeLocations ? ["home-points", "home-symbols"] : []),
                    ...(showWorkLocations ? ["work-points", "work-symbols"] : []),
                    ...(showTravelLocations ? ["travel-points", "travel-symbols"] : []),
                    ...(showFutureLocations ? ["future-points", "future-symbols"] : []),
                ]}
            >
                <Source id="my-data" type="geojson" data={geoJson}>
                    {showHomeLocations && <Layer {...homeLayerStyle} />}
                    {showHomeLocations && <Layer {...homeSymbolLayerStyle} />}
                    {showFutureLocations && <Layer {...futureLayerStyle} />}
                    {showFutureLocations && <Layer {...futureSymbolLayerStyle} />}
                    {showWorkLocations && <Layer {...workLayerStyle} />}
                    {showWorkLocations && <Layer {...workSymbolLayerStyle} />}
                    {showTravelLocations && <Layer {...travelLayerStyle} />}
                    {showTravelLocations && <Layer {...travelSymbolLayerStyle} />}
                </Source>
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
                                    dangerouslySetInnerHTML={{ __html: popupInfo.description }}
                                />

                                {/* Type pill */}
                                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            padding: "8px 16px",
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
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#333" }}>Place Types</h4>
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
                </div>
                <div
                    style={{
                        position: "absolute",
                        bottom: "20px",
                        right: "20px",
                        zIndex: 1,
                    }}
                >
                    <button
                        onClick={resetMap}
                        style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#fff",
                            backgroundColor: "#007bff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            transition: "background-color 0.3s, transform 0.1s",
                        }}
                        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
                        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                        Reset View
                    </button>
                </div>
            </Map>
        </>
    );
}

export default MapComponent;
