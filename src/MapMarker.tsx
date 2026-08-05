import React, { useState } from "react";

export interface MapMarkerProps {
    place: string;
    localname: string | null;
    placeType: string;
    isSelected?: boolean;
    onClick: (e: React.MouseEvent) => void;
}

// Configuration for pin categories with clean unicolor palette
const CATEGORY_CONFIG: Record<
    string,
    {
        color: string;
        emoji: string;
        shadow: string;
    }
> = {
    Home: {
        color: "#10b981",
        emoji: "𖠿",
        shadow: "rgba(16, 185, 129, 0.35)",
    },
    Work: {
        color: "#3b82f6",
        emoji: "⛁",
        shadow: "rgba(59, 130, 246, 0.35)",
    },
    Travel: {
        color: "#ec4899",
        emoji: "✈",
        shadow: "rgba(236, 72, 153, 0.35)",
    },
    Future: {
        color: "#f59e0b",
        emoji: "☆",
        shadow: "rgba(245, 158, 11, 0.35)",
    },
};

const DEFAULT_CONFIG = {
    color: "#6b7280",
    emoji: "📍",
    shadow: "rgba(107, 114, 128, 0.35)",
};

export const MapMarker: React.FC<MapMarkerProps> = ({
    place,
    localname,
    placeType,
    isSelected = false,
    onClick,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const config = CATEGORY_CONFIG[placeType] || DEFAULT_CONFIG;

    return (
        <div
            style={{
                position: "relative",
                cursor: "pointer",
                userSelect: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "transparent",
                zIndex: isHovered || isSelected ? 100 : 1,
            }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Hover Tooltip Card */}
            {(isHovered || isSelected) && (
                <div
                    className="marker-tooltip"
                    style={{
                        position: "absolute",
                        bottom: "100%",
                        marginBottom: "10px",
                        padding: "6px 12px",
                        background: "rgba(15, 23, 42, 0.9)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                        color: "#fff",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        animation: "tooltipFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                    }}
                >
                    <span style={{ fontSize: "14px" }}>{config.emoji}</span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{place}</span>
                        {localname && (
                            <span style={{ fontSize: "11px", fontWeight: 400, opacity: 0.7, fontStyle: "italic" }}>
                                {localname}
                            </span>
                        )}
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 0,
                            height: 0,
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderTop: "5px solid rgba(15, 23, 42, 0.9)",
                        }}
                    />
                </div>
            )}

            {/* Unicolor Pin (Solid category color pin, white icon/emoticon inside, transparent background) */}
            <div
                style={{
                    position: "relative",
                    background: "transparent",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform: isHovered || isSelected ? "scale(1.25) translateY(-4px)" : "scale(1)",
                }}
            >
                {/* SVG Unicolor Teardrop Pin */}
                <svg
                    width="34"
                    height="44"
                    viewBox="0 0 34 44"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        filter: `drop-shadow(0 4px 8px ${config.shadow})`,
                    }}
                >
                    {/* Solid Unicolor Pin Shape */}
                    <path
                        d="M17 1C8.163 1 1 8.163 1 17c0 11 16 26 16 26s16-15 16-26C33 8.163 25.837 1 17 1z"
                        fill={config.color}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                    />

                    {/* White Icon/Symbol Centered inside Unicolor Pin */}
                    <text
                        x="17"
                        y="16.5"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="20"
                        fontWeight="bold"
                        fill="#ffffff"
                        pointerEvents="none"
                    >
                        {config.emoji}
                    </text>
                </svg>
            </div>
        </div>
    );
};

export default MapMarker;
