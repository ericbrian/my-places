import { useState, useRef, useEffect } from "react";
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

    const [viewState, setViewState] = useState({
        longitude: 10,
        latitude: 30,
        zoom: 2,
    });

    const [showFutureLocations, setShowFutureLocations] = useState(false);

    // Fit map to bounds when component mounts
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.fitBounds(bounds.fitBounds, {
                padding: { top: 80, bottom: 40, left: 40, right: 200 }, // Extra padding for title and legend
                maxZoom: 6, // Prevent zooming in too much
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            minZoom={1}
            interactiveLayerIds={[
                "home-points",
                "work-points",
                "travel-points",
                "home-symbols",
                "work-symbols",
                "travel-symbols",
                ...(showFutureLocations ? ["future-points", "future-symbols"] : []),
            ]}
        >
            <Source id="my-data" type="geojson" data={geoJson}>
                <Layer {...homeLayerStyle} />
                <Layer {...homeSymbolLayerStyle} />
                {showFutureLocations && <Layer {...futureLayerStyle} />}
                {showFutureLocations && <Layer {...futureSymbolLayerStyle} />}
                <Layer {...workLayerStyle} />
                <Layer {...workSymbolLayerStyle} />
                <Layer {...travelLayerStyle} />
                <Layer {...travelSymbolLayerStyle} />
            </Source>
            {popupInfo && (
                <Popup longitude={popupInfo.longitude} latitude={popupInfo.latitude} onClose={() => setPopupInfo(null)} closeButton={true} closeOnClick={false} maxWidth="400px">
                    <div style={{ padding: "8px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                            <span style={{ fontSize: "16px", flexShrink: 0, lineHeight: 1.2 }}>
                                {popupInfo.placeType === "Home" && "🏠"}
                                {popupInfo.placeType === "Work" && "💼"}
                                {popupInfo.placeType === "Travel" && "🎉"}
                                {popupInfo.placeType === "Future" && "⭐"}
                            </span>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <h3 style={{ margin: "0", color: "#333", lineHeight: "1.2" }}>{popupInfo.place}</h3>
                                {popupInfo.localname && <h4 style={{ margin: "0", color: "#555", fontWeight: "normal", fontStyle: "italic" }}>{popupInfo.localname}</h4>}
                            </div>
                        </div>
                        <p
                            style={{
                                margin: "0 0 8px 0",
                                padding: "4px 8px",
                                backgroundColor:
                                    popupInfo.placeType === "Home"
                                        ? "#E8F5E8"
                                        : popupInfo.placeType === "Work"
                                        ? "#E3F2FD"
                                        : popupInfo.placeType === "Travel"
                                        ? "#FCE4EC"
                                        : "#FFF3E0",
                                color:
                                    popupInfo.placeType === "Home"
                                        ? "#4CAF50"
                                        : popupInfo.placeType === "Work"
                                        ? "#2196F3"
                                        : popupInfo.placeType === "Travel"
                                        ? "#E91E63"
                                        : "#FF9800",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "bold",
                            }}
                        >
                            {popupInfo.placeType}
                        </p>
                        <div style={{ fontSize: "14px", lineHeight: "1.4", color: "#333" }} dangerouslySetInnerHTML={{ __html: popupInfo.description }} />
                    </div>
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
                }}
            >
                <h4 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#333" }}>Place Types</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "4px",
                            borderRadius: "4px",
                            border: "1px solid rgba(76, 175, 80, 0.3)",
                            backgroundColor: "rgba(76, 175, 80, 0.1)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                backgroundColor: "#4CAF50",
                                border: "2px solid white",
                                fontSize: "12px",
                            }}
                        >
                            🏠
                        </div>
                        <span style={{ color: "#333", fontWeight: "bold" }}>Home</span>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "4px",
                            borderRadius: "4px",
                            border: "1px solid rgba(33, 150, 243, 0.3)",
                            backgroundColor: "rgba(33, 150, 243, 0.1)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                backgroundColor: "#2196F3",
                                border: "2px solid white",
                                fontSize: "12px",
                            }}
                        >
                            💼
                        </div>
                        <span style={{ color: "#333", fontWeight: "bold" }}>Work</span>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "4px",
                            borderRadius: "4px",
                            border: "1px solid rgba(233, 30, 99, 0.3)",
                            backgroundColor: "rgba(233, 30, 99, 0.1)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                backgroundColor: "#E91E63",
                                border: "2px solid white",
                                fontSize: "12px",
                            }}
                        >
                            🎉
                        </div>
                        <span style={{ color: "#333", fontWeight: "bold" }}>Travel</span>
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
        </Map>
    );
}

export default MapComponent;
