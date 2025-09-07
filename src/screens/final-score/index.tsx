export function FinalScoreScreen({totalScore, onRestart}: { totalScore: number, onRestart: () => void }) {
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#282c34',
            color: 'white',
            userSelect: 'none'
        }}>
            <h1>Final Score</h1>
            <p style={{fontSize: '24px'}}>Your total score is:</p>
            <p style={{fontSize: '48px', fontWeight: 'bold'}}>{totalScore}</p>
            <button style={{
                padding: '10px 20px',
                fontSize: '18px',
                marginTop: '20px',
                cursor: 'pointer',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: '#61dafb',
                color: '#282c34'
            }} onClick={onRestart}>Play Again
            </button>
        </div>
    );
}