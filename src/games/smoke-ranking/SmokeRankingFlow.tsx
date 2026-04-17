import React from 'react';
import seedRandom from 'seedrandom';
import allLocations from '../../data/metadata.json';
import Vote from './screens/Vote';
import Leaderboard from './screens/Leaderboard';
import {SMOKE_ELO_BACKEND_URL} from '../../config';
import {makeLocalDate} from '../../utils/rng';

export type SmokeScore = {
    fileName: string;
    elo: number;
    wins: number;
    losses: number;
};

function getDailyVoteKey(): string {
    return `smoke-daily-votes-${makeLocalDate()}`;
}

function loadDailyVoteCount(): number {
    return parseInt(localStorage.getItem(getDailyVoteKey()) ?? '0', 10);
}

function saveDailyVoteCount(count: number): void {
    localStorage.setItem(getDailyVoteKey(), count.toString());
}

async function recordVote(winnerId: string, loserId: string): Promise<void> {
    await fetch(`${SMOKE_ELO_BACKEND_URL}/votes`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({winner: winnerId, loser: loserId}),
    });
}

function pickPair(exclude: string[]): [string, string] {
    const available = (allLocations as { fileName: string }[])
        .map(l => l.fileName)
        .filter(f => !exclude.includes(f));
    const rng = seedRandom();
    const i = Math.floor(rng() * available.length);
    let j = Math.floor(rng() * (available.length - 1));
    if (j >= i) j++;
    return [available[i], available[j]];
}

type SRView = 'vote' | 'leaderboard';

function SmokeRankingFlow() {
    const [view, setView] = React.useState<SRView>(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('view') === 'leaderboard' ? 'leaderboard' : 'vote';
    });
    const [pair, setPair] = React.useState<[string, string]>(() => pickPair([]));
    const [seenPairs, setSeenPairs] = React.useState<string[]>([]);
    const [dailyVoteCount, setDailyVoteCount] = React.useState(() => loadDailyVoteCount());

    async function handleVote(winnerId: string, loserId: string) {
        await recordVote(winnerId, loserId);
        const newCount = dailyVoteCount + 1;
        saveDailyVoteCount(newCount);
        setDailyVoteCount(newCount);
        const seen = [...seenPairs, pair[0], pair[1]];
        setSeenPairs(seen);
        setPair(pickPair(seen.length >= (allLocations.length - 2) ? [] : seen));
    }

    function handleViewLeaderboard() {
        setView('leaderboard');
    }

    function handleVoteAgain() {
        setView('vote');
    }

    const onExit = () => { window.location.href = import.meta.env.BASE_URL; };

    return (
        <>
            {view === 'vote' && (
                <Vote pair={pair} onVote={handleVote} onViewLeaderboard={handleViewLeaderboard} onExit={onExit} dailyVoteCount={dailyVoteCount}/>
            )}
            {view === 'leaderboard' && (
                <Leaderboard onVoteAgain={handleVoteAgain} onExit={onExit} dailyVoteCount={dailyVoteCount}/>
            )}
        </>
    );
}

export default SmokeRankingFlow;
