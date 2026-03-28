import React from 'react';
import {useLocation} from 'wouter';
import seedRandom from 'seedrandom';
import allLocations from '../../../public/locations/metadata.json';
import Vote from './screens/Vote';
import Leaderboard from './screens/Leaderboard';

export const SMOKE_RANKING_STORAGE_KEY = 'smokeRanking_scores';

export type SmokeScore = {
    fileName: string;
    wins: number;
    losses: number;
};

export function getSmokeScores(): Record<string, SmokeScore> {
    try {
        return JSON.parse(localStorage.getItem(SMOKE_RANKING_STORAGE_KEY) ?? '{}');
    } catch {
        return {};
    }
}

export function recordVote(winnerId: string, loserId: string) {
    const scores = getSmokeScores();
    if (!scores[winnerId]) scores[winnerId] = {fileName: winnerId, wins: 0, losses: 0};
    if (!scores[loserId]) scores[loserId] = {fileName: loserId, wins: 0, losses: 0};
    scores[winnerId].wins += 1;
    scores[loserId].losses += 1;
    localStorage.setItem(SMOKE_RANKING_STORAGE_KEY, JSON.stringify(scores));
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

    function handleVote(winnerId: string, loserId: string) {
        recordVote(winnerId, loserId);
        const seen = [...seenPairs, pair[0], pair[1]];
        setSeenPairs(seen);
        setPair(pickPair(seen.length >= (allLocations.length - 2) ? [] : seen));
        navigate('/smoke-ranking/leaderboard');
    }

    function handleVoteAgain() {
        navigate('/smoke-ranking');
    }

    const onExit = () => navigate('/');

    return (
        <>
            {routerLocation === '/smoke-ranking' && (
                <Vote pair={pair} onVote={handleVote} onExit={onExit}/>
            )}
            {routerLocation === '/smoke-ranking/leaderboard' && (
                <Leaderboard onVoteAgain={handleVoteAgain} onExit={onExit}/>
            )}
        </>
    );
}

export default SmokeRankingFlow;
