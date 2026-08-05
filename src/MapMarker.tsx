import React, { useState } from "react";

export type MarkerStyleType = "glass-pin" | "floating-badge" | "glowing-dot";

export interface MapMarkerProps {
    place: string;
    localname: string | null;
    placeType: string;
    styleType?: MarkerStyleType;
    isSelected?: boolean;
    onClick: (e: React.MouseEvent) => void;
}

// Configuration for pin categories
const CATEGORY_CONFIG: Record<
    string,
    {
        color: string;
        gradient: [string, string];
        emoji: string;
        shadow: string;
        glow: string;
    }
> = {
    Home: {
        color: "#10b981",
        gradient: ["#34d399", "#059669"],
        emoji: "🏠",
        shadow: "rgba(16, 185, 129, 0.4)",
        glow: "rgba(52, 211, 153, 0.6)",
    },
    Work: {
        color: "#3b82f6",
        gradient: ["#60a5fa", "#2563eb"],
        emoji: "💼",
        shadow: "rgba(59, 130, 246, 0.4)",
        glow: "rgba(96, 165, 250, 0.6)",
    },
    Travel: {
        color: "#ec4899",
        gradient: ["#f472b6", "#db2777"],
        emoji: "✈️",
        shadow: "rgba(236, 72, 153, 0.4)",
        glow: "rgba(244, 114, 182, 0.6)",
    },
    Future: {
        color: "#f59e0b",
        gradient: ["#fbbf24", "#d97706"],
        emoji: "🌟",
        shadow: "rgba(245, 158, 11, 0.4)",
        glow: "rgba(251, 191, 36, 0.6)",
    },
};

const DEFAULT_CONFIG = {
    color: "#6b7280",
    gradient: ["#9ca3af", "#4b5563"] as [string, string],
    emoji: "📍",
    shadow: "rgba(107, 114, 128, 0.4)",
    glow: "rgba(156, 163, 175, 0.6)",
};

export const MapMarker: React.FC<MapMarkerProps> = ({
    place,
    localname,
    placeType,
    styleType = "glass-pin",
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
                        marginBottom: "12px",
                        padding: "6px 12px",
                        background: "rgba(15, 23, 42, 0.88)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "10px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
                        color: "#fff",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        animation: "tooltipFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
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
                            borderLeft: "6px solid transparent",
                            borderRight: "6px solid transparent",
                            borderTop: "6px solid rgba(15, 23, 42, 0.88)",
                        }}
                    />
                </div>
            )}

            {/* STYLE 1: 3D Glassmorphic Pin */}
            {styleType === "glass-pin" && (
                <div
                    style={{
                        position: "relative",
                        transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transform: isHovered || isSelected ? "scale(1.25) translateY(-4px)" : "scale(1)",
                    }}
                >
                    {/* Outer glowing aura ring */}
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: "36px",
                            height: "36px",
                            marginTop: "-18px",
                            marginLeft: "-18px",
                            borderRadius: "50%",
                            background: config.glow,
                            opacity: isHovered || isSelected ? 0.8 : 0.35,
                            filter: "blur(8px)",
                            transition: "opacity 0.25s ease",
                            animation: isHovered || isSelected ? "markerPulse 1.8s infinite" : "none",
                        }}
                    />

                    {/* SVG 3D Teardrop Pin */}
                    <svg
                        width="38"
                        height="48"
                        viewBox="0 0 38 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            filter: `drop-shadow(0 6px 12px ${config.shadow})`,
                        }}
                    >
                        <defs>
                            <linearGradient id={`pinGradient-${placeType}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={config.gradient[0]} />
                                <stop offset="100%" stopColor={config.gradient[1]} />
                            </linearGradient>
                            <linearGradient id={`pinGlassHighlight-${placeType}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                                <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                            </linearGradient>
                            <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feComponentTransfer in="SourceAlpha">
                                    <feFuncA type="linear" slope="0.7" />
                                </feComponentTransfer>
                                <feGaussianBlur stdDeviation="1.5" result="blur" />
                                <feOffset dx="0" dy="1.5" />
                                <feComposite operator="out" in2="SourceAlpha" result="inverse" />
                                <feFlood floodColor="black" floodOpacity="0.25" result="color" />
                                <feComposite operator="in" in2="inverse" result="shadow" />
                                <feComposite operator="over" in2="SourceGraphic" />
                            </filter>
                        </defs>

                        {/* Outer Pin Body */}
                        <path
                            d="M19 1C9.059 1 1 9.059 1 19c0 12.5 18 28 18 28s18-15.5 18-28C37 9.059 28.941 1 19 1z"
                            fill={`url(#pinGradient-${placeType})`}
                            stroke="#ffffff"
                            strokeWidth="2"
                        />

                        {/* Glass Highlight Arc */}
                        <path
                            d="M19 2.5C10 2.5 3 9.5 3 18.5c0 3.2 1.2 6.5 3.5 9.8L19 43.5l12.5-15.2C33.8 25 35 21.7 35 18.5 35 9.5 28 2.5 19 2.5z"
                            fill={`url(#pinGlassHighlight-${placeType})`}
                            pointerEvents="none"
                        />

                        {/* Inner White Glass Sphere Badge */}
                        <circle
                            cx="19"
                            cy="18.5"
                            r="11.5"
                            fill="#ffffff"
                            opacity="0.95"
                            style={{
                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
                            }}
                        />
                    </svg>

                    {/* Emoji inside center badge */}
                    <span
                        style={{
                            position: "absolute",
                            top: "9px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: "15px",
                            lineHeight: "1",
                            pointerEvents: "none",
                            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
                        }}
                    >
                        {config.emoji}
                    </span>
                </div>
            )}

            {/* STYLE 2: Floating Glass Badge (Pill Style) */}
            {styleType === "floating-badge" && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 12px 5px 6px",
                        background: "rgba(255, 255, 255, 0.85)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: `1.5px solid ${config.color}`,
                        borderRadius: "20px",
                        boxShadow: isHovered || isSelected
                            ? `0 8px 20px -2px ${config.shadow}, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`
                            : "0 4px 12px rgba(0, 0, 0, 0.12)",
                        transform: isHovered || isSelected ? "scale(1.15) translateY(-3px)" : "scale(1)",
                        transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                >
                    <div
                        style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "13px",
                            boxShadow: `0 2px 6px ${config.shadow}`,
                        }}
                    >
                        {config.emoji}
                    </div>
                    <span
                        style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#1e293b",
                            maxWidth: "110px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {place.split(",")[0]}
                    </span>
                </div>
            )}

            {/* STYLE 3: Glowing Minimal Dot */}
            {styleType === "glowing-dot" && (
                <div
                    style={{
                        position: "relative",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {/* Animated Pulsing Ring */}
                    <div
                        style={{
                            position: "absolute",
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            border: `2px solid ${config.color}`,
                            opacity: isHovered || isSelected ? 0.9 : 0.4,
                            animation: "markerPulse 1.8s infinite ease-in-out",
                        }}
                    />
                    {/* Inner Solid Dot */}
                    <div
                        style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
                            border: "2px solid #ffffff",
                            boxShadow: `0 0 10px ${config.color}`,
                            transform: isHovered || isSelected ? "scale(1.3)" : "scale(1)",
                            transition: "transform 0.2s ease",
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default MapMarker;
