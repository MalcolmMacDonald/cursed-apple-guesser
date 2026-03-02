import React from "react";

type GameEntry = {
    id: string;
    title: string;
    description: string;
    icon: string;
    gradient: string;
    available: boolean;
    tags: string[];
};

const games: GameEntry[] = [
    {
        id: "geoguesser",
        title: "Cursed Apple Guesser",
        description: "Drop a pin on the map to guess where a screenshot was taken. The closer you are, the higher you score.",
        icon: "🗺️",
        gradient: "linear-gradient(135deg, #1a472a 0%, #2d6a4f 50%, #40916c 100%)",
        available: true,
        tags: ["Location", "5 Rounds"],
    },
    {
        id: "nameit",
        title: "Name That Spot",
        description: "Recognise the location — but can you name it? Pick the correct spot name from four choices before time's up.",
        icon: "📍",
        gradient: "linear-gradient(135deg, #1a1a4e 0%, #2d2d8f 50%, #4a4ac4 100%)",
        available: false,
        tags: ["Multiple Choice", "Coming Soon"],
    },
    {
        id: "navigate",
        title: "Dead Reckoning",
        description: "You're shown a start and a destination. Give step-by-step directions — forward, left, turn around — to get there.",
        icon: "🧭",
        gradient: "linear-gradient(135deg, #3d2000 0%, #7a4500 50%, #b86800 100%)",
        available: false,
        tags: ["Navigation", "Coming Soon"],
    },
    {
        id: "aboutface",
        title: "About Face",
        description: "Study the screenshot carefully, then pick which other screenshot was taken facing the exact opposite direction.",
        icon: "🔄",
        gradient: "linear-gradient(135deg, #3d001a 0%, #7a0035 50%, #b80050 100%)",
        available: false,
        tags: ["Orientation", "Coming Soon"],
    },
];

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(160deg, #0d0d1a 0%, #111122 50%, #0a0a16 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowY: "auto",
        overflowX: "hidden",
        padding: "0 0 60px 0",
        boxSizing: "border-box",
    },
    header: {
        width: "100%",
        padding: "56px 40px 40px",
        boxSizing: "border-box",
        textAlign: "center",
    },
    badge: {
        display: "inline-block",
        background: "rgba(99,102,241,0.15)",
        border: "1px solid rgba(99,102,241,0.4)",
        color: "#a5b4fc",
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        padding: "6px 16px",
        borderRadius: "100px",
        marginBottom: "20px",
    },
    title: {
        margin: "0 0 16px",
        fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
        fontWeight: 800,
        letterSpacing: "-0.02em",
        background: "linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        lineHeight: 1.1,
    },
    subtitle: {
        margin: "0 auto",
        maxWidth: "480px",
        fontSize: "1rem",
        color: "rgba(255,255,255,0.45)",
        lineHeight: 1.6,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "20px",
        width: "100%",
        maxWidth: "1100px",
        padding: "0 32px",
        boxSizing: "border-box",
    },
    card: {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        cursor: "pointer",
    },
    cardDisabled: {
        opacity: 0.45,
        cursor: "default",
    },
    cardArt: {
        height: "140px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "3.5rem",
        position: "relative",
        overflow: "hidden",
    },
    cardBody: {
        padding: "20px 24px 24px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        gap: "10px",
    },
    cardTitle: {
        margin: 0,
        fontSize: "1.1rem",
        fontWeight: 700,
        color: "#ffffff",
        letterSpacing: "-0.01em",
    },
    cardDesc: {
        margin: 0,
        fontSize: "0.85rem",
        color: "rgba(255,255,255,0.5)",
        lineHeight: 1.6,
        flex: 1,
    },
    tagRow: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap" as const,
    },
    tag: {
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        color: "rgba(255,255,255,0.4)",
        background: "rgba(255,255,255,0.07)",
        padding: "4px 10px",
        borderRadius: "6px",
    },
    playBtn: {
        marginTop: "4px",
        padding: "11px 0",
        width: "100%",
        background: "rgba(99,102,241,0.9)",
        border: "none",
        borderRadius: "12px",
        color: "#ffffff",
        fontSize: "0.9rem",
        fontWeight: 600,
        cursor: "pointer",
        letterSpacing: "0.02em",
        transition: "background 0.2s ease, transform 0.1s ease",
    },
    comingSoonBtn: {
        marginTop: "4px",
        padding: "11px 0",
        width: "100%",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        color: "rgba(255,255,255,0.3)",
        fontSize: "0.9rem",
        fontWeight: 600,
        cursor: "not-allowed",
        letterSpacing: "0.02em",
    },
    divider: {
        width: "48px",
        height: "2px",
        background: "linear-gradient(90deg, rgba(99,102,241,0.8), transparent)",
        margin: "32px auto",
        borderRadius: "2px",
    },
};

function GameCard({ game, onPlay }: { game: GameEntry; onPlay: () => void }) {
    const [hovered, setHovered] = React.useState(false);

    return (
        <div
            style={{
                ...styles.card,
                ...(game.available ? {} : styles.cardDisabled),
                transform: hovered && game.available ? "translateY(-4px)" : "translateY(0)",
                boxShadow: hovered && game.available
                    ? "0 20px 40px rgba(0,0,0,0.5)"
                    : "0 4px 16px rgba(0,0,0,0.3)",
                borderColor: hovered && game.available
                    ? "rgba(99,102,241,0.35)"
                    : "rgba(255,255,255,0.08)",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{ ...styles.cardArt, background: game.gradient }}>
                <span style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}>
                    {game.icon}
                </span>
            </div>
            <div style={styles.cardBody}>
                <p style={styles.cardTitle}>{game.title}</p>
                <p style={styles.cardDesc}>{game.description}</p>
                <div style={styles.tagRow}>
                    {game.tags.map(t => <span key={t} style={styles.tag}>{t}</span>)}
                </div>
                {game.available ? (
                    <button
                        style={{
                            ...styles.playBtn,
                            background: hovered
                                ? "rgba(99,102,241,1)"
                                : "rgba(99,102,241,0.9)",
                            transform: hovered ? "scale(1.01)" : "scale(1)",
                        }}
                        onClick={onPlay}
                    >
                        Play Now
                    </button>
                ) : (
                    <button style={styles.comingSoonBtn} disabled>
                        Coming Soon
                    </button>
                )}
            </div>
        </div>
    );
}

function HubScreen({ onSelectGame }: { onSelectGame: (id: string) => void }) {
    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div style={styles.badge}>Game Hub</div>
                <h1 style={styles.title}>Pick Your Poison</h1>
                <p style={styles.subtitle}>
                    A growing collection of cursed little games. Choose wisely.
                </p>
            </div>

            <div style={styles.divider} />

            <div style={styles.grid}>
                {games.map(game => (
                    <GameCard
                        key={game.id}
                        game={game}
                        onPlay={() => onSelectGame(game.id)}
                    />
                ))}
            </div>
        </div>
    );
}

export default HubScreen;
