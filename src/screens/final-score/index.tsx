import type {GameData, GameScreenName} from "../../types.ts";

export function FinalScoreScreen({setState, gameData}:
                                 {
                                     setState: (state: GameScreenName) => void,
                                     gameData: GameData
                                 }) {

    const totalScore = gameData.scores.reduce((a, b) => a + b, 0);

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
            <p style={{fontSize: '32px', fontWeight: 'bold'}}>{totalScore} out of a
                possible {gameData.totalRounds * 1000}</p>
            <button style={{
                padding: '10px 20px',
                fontSize: '18px',
                marginTop: '20px',
                cursor: 'pointer',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: '#61dafb',
                color: '#282c34'
            }} onClick={() => setState('landing')}>Play Again
            </button>
        </div>
    );
}