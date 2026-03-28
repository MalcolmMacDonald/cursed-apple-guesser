import React from 'react';
import {useLocation} from 'wouter';
import seedRandom from 'seedrandom';
import allLocations from '../../../public/locations/metadata.json';
import Vote from './screens/Vote';
import Leaderboard from './screens/Leaderboard';

export const SMOKE_RANKING_BACKEND_URL = 'https://malloc--ae8f7de82aca11f1be7a42dde27851f2.web.val.run';

export type SmokeScore = {
    fileName: string;
    wins: number;
    losses: number;
};

async function recordVote(winnerId: string, loserId: string): Promise<void> {
    await fetch(`${SMOKE_RANKING_BACKEND_URL}/votes`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({winner: winnerId, loser: loserId}),
    });
}

function pickPair(exclude: string[]): [string, string] {
    const available = (allLocations as {fileName: string}[])
        .map(l => l.fileName)
        .filter(f => !exclude.includes(f));
    const rng = seedRandom(Date.now().toString());
    const i = Math.floor(rng() * available.length);
    let j = Math.floor(rng() * (available.length - 1));
    if (j >= i) j++;
    return [available[i], available[j]];
}

function SmokeRankingFlow() {
    const [routerLocation, navigate] = useLocation();
    const [pair, setPair] = React.useState<[string, string]>(() => pickPair([]));
    const [seenPairs, setSeenPairs] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (routerLocation !== '/smoke-ranking' && routerLocation !== '/smoke-ranking/leaderboard') {
            navigate('/smoke-ranking');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleVote(winnerId: string, loserId: string) {
        await recordVote(winnerId, loserId);
        const seen = [...seenPairs, pair[0], pair[1]];
        setSeenPairs(seen);
        setPair(pickPair(seen.length >= (allLocations.length - 2) ? [] : seen));
    }

    function handleViewLeaderboard() {
        navigate('/smoke-ranking/leaderboard');
    }

    function handleVoteAgain() {
        navigate('/smoke-ranking');
    }

    const onExit = () => navigate('/');

    return (
        <>
            {routerLocation === '/smoke-ranking' && (
                <Vote pair={pair} onVote={handleVote} onViewLeaderboard={handleViewLeaderboard} onExit={onExit}/>
            )}
            {routerLocation === '/smoke-ranking/leaderboard' && (
                <Leaderboard onVoteAgain={handleVoteAgain} onExit={onExit}/>
            )}
        </>
    );
}

export default SmokeRankingFlow;
