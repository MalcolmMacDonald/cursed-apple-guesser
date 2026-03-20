import React from 'react';

const REPO = 'MalcolmMacDonald/cursed-apple-guesser';
const API = 'https://api.github.com';

type Issue = {
    number: number;
    title: string;
    body: string | null;
    state: 'open' | 'closed';
    labels: { name: string; color: string }[];
    html_url: string;
    created_at: string;
    user: { login: string } | null;
};

type Column = 'backlog' | 'in_progress' | 'done';

function getColumn(issue: Issue): Column {
    if (issue.state === 'closed') return 'done';
    if (issue.labels.some(l => l.name.toLowerCase() === 'in progress')) return 'in_progress';
    return 'backlog';
}

function IssueCard({
    issue,
    token,
    onRefresh,
}: {
    issue: Issue;
    token: string;
    onRefresh: () => void;
}) {
    const [expanded, setExpanded] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    async function moveToInProgress() {
        setLoading(true);
        await fetch(`${API}/repos/${REPO}/issues/${issue.number}/labels`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ labels: ['in progress'] }),
        });
        setLoading(false);
        onRefresh();
    }

    async function moveToBacklog() {
        setLoading(true);
        await fetch(`${API}/repos/${REPO}/issues/${issue.number}/labels/in%20progress`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        setLoading(false);
        onRefresh();
    }

    async function closeIssue() {
        setLoading(true);
        await fetch(`${API}/repos/${REPO}/issues/${issue.number}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: 'closed' }),
        });
        setLoading(false);
        onRefresh();
    }

    async function reopenIssue() {
        setLoading(true);
        await fetch(`${API}/repos/${REPO}/issues/${issue.number}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: 'open' }),
        });
        setLoading(false);
        onRefresh();
    }

    const col = getColumn(issue);

    return (
        <div
            style={{
                background: '#1e1e2e',
                border: '1px solid #313244',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: 8,
                cursor: 'pointer',
                opacity: loading ? 0.5 : 1,
            }}
            onClick={() => setExpanded(e => !e)}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: '#6c7086', fontSize: 11, flexShrink: 0, marginTop: 1 }}>
                    #{issue.number}
                </span>
                <span style={{ fontSize: 13, color: '#cdd6f4', flex: 1, lineHeight: 1.4 }}>
                    {issue.title}
                </span>
            </div>
            {issue.labels.filter(l => l.name.toLowerCase() !== 'in progress').length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                    {issue.labels
                        .filter(l => l.name.toLowerCase() !== 'in progress')
                        .map(l => (
                            <span
                                key={l.name}
                                style={{
                                    background: `#${l.color}33`,
                                    border: `1px solid #${l.color}88`,
                                    color: `#${l.color}`,
                                    borderRadius: 4,
                                    fontSize: 10,
                                    padding: '1px 6px',
                                }}
                            >
                                {l.name}
                            </span>
                        ))}
                </div>
            )}
            {expanded && (
                <div
                    style={{ marginTop: 8 }}
                    onClick={e => e.stopPropagation()}
                >
                    {issue.body && (
                        <p style={{ color: '#a6adc8', fontSize: 12, margin: '0 0 8px', lineHeight: 1.5 }}>
                            {issue.body}
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {col === 'backlog' && token && (
                            <button
                                style={btnStyle('#89b4fa')}
                                onClick={moveToInProgress}
                                disabled={loading}
                            >
                                → In Progress
                            </button>
                        )}
                        {col === 'in_progress' && token && (
                            <button
                                style={btnStyle('#a6adc8')}
                                onClick={moveToBacklog}
                                disabled={loading}
                            >
                                ← Backlog
                            </button>
                        )}
                        {col !== 'done' && token && (
                            <button
                                style={btnStyle('#a6e3a1')}
                                onClick={closeIssue}
                                disabled={loading}
                            >
                                Close ✓
                            </button>
                        )}
                        {col === 'done' && token && (
                            <button
                                style={btnStyle('#f38ba8')}
                                onClick={reopenIssue}
                                disabled={loading}
                            >
                                Reopen
                            </button>
                        )}
                        <a
                            href={issue.html_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ ...btnStyle('#cba6f7'), textDecoration: 'none' }}
                        >
                            GitHub ↗
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

function btnStyle(color: string): React.CSSProperties {
    return {
        background: 'transparent',
        border: `1px solid ${color}`,
        color,
        borderRadius: 4,
        padding: '3px 10px',
        fontSize: 11,
        cursor: 'pointer',
    };
}

function KanbanColumn({
    title,
    color,
    issues,
    token,
    onRefresh,
}: {
    title: string;
    color: string;
    issues: Issue[];
    token: string;
    onRefresh: () => void;
}) {
    return (
        <div
            style={{
                flex: '1 1 280px',
                minWidth: 240,
                maxWidth: 400,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: `2px solid ${color}`,
                }}
            >
                <span style={{ fontSize: 13, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {title}
                </span>
                <span
                    style={{
                        background: color + '33',
                        color,
                        borderRadius: 10,
                        fontSize: 11,
                        padding: '1px 7px',
                        fontWeight: 600,
                    }}
                >
                    {issues.length}
                </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {issues.length === 0 ? (
                    <p style={{ color: '#45475a', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
                        No issues
                    </p>
                ) : (
                    issues.map(issue => (
                        <IssueCard
                            key={issue.number}
                            issue={issue}
                            token={token}
                            onRefresh={onRefresh}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function CreateIssueForm({ token, onCreated }: { token: string; onCreated: () => void }) {
    const [open, setOpen] = React.useState(false);
    const [title, setTitle] = React.useState('');
    const [body, setBody] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);
        setError('');
        const res = await fetch(`${API}/repos/${REPO}/issues`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title.trim(), body: body.trim() || undefined, labels: ['claude'] }),
        });
        setLoading(false);
        if (res.ok) {
            setTitle('');
            setBody('');
            setOpen(false);
            onCreated();
        } else {
            const data = await res.json();
            setError(data.message ?? 'Failed to create issue');
        }
    }

    if (!open) {
        return (
            <button
                style={{
                    background: '#313244',
                    border: '1px dashed #45475a',
                    color: '#a6adc8',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 13,
                    cursor: 'pointer',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                }}
                onClick={() => setOpen(true)}
            >
                + New Issue
            </button>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                background: '#1e1e2e',
                border: '1px solid #89b4fa',
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
            }}
        >
            <span style={{ color: '#89b4fa', fontWeight: 600, fontSize: 13 }}>New Issue</span>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={inputStyle}
                autoFocus
            />
            <textarea
                placeholder="Description (optional)"
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
            />
            {error && <span style={{ color: '#f38ba8', fontSize: 11 }}>{error}</span>}
            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    type="submit"
                    disabled={loading || !title.trim()}
                    style={btnStyle('#a6e3a1')}
                >
                    {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={btnStyle('#f38ba8')}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

const inputStyle: React.CSSProperties = {
    background: '#181825',
    border: '1px solid #313244',
    borderRadius: 6,
    color: '#cdd6f4',
    padding: '6px 10px',
    fontSize: 13,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
};

export default function KanbanScreen({ onBack }: { onBack: () => void }) {
    const [issues, setIssues] = React.useState<Issue[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [token, setToken] = React.useState(
        () => import.meta.env.VITE_GITHUB_TOKEN ?? ''
    );
    const [tokenInput, setTokenInput] = React.useState(token);

    async function fetchIssues() {
        setLoading(true);
        setError('');
        try {
            const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
            if (token) headers.Authorization = `Bearer ${token}`;

            const [openRes, closedRes] = await Promise.all([
                fetch(`${API}/repos/${REPO}/issues?state=open&per_page=100`, { headers }),
                fetch(`${API}/repos/${REPO}/issues?state=closed&per_page=50`, { headers }),
            ]);

            if (!openRes.ok) throw new Error(`GitHub API error: ${openRes.status}`);
            const open: Issue[] = await openRes.json();
            const closed: Issue[] = closedRes.ok ? await closedRes.json() : [];

            // Filter out pull requests
            setIssues([...open, ...closed].filter((i: any) => !i.pull_request));
        } catch (e: any) {
            setError(e.message ?? 'Failed to load issues');
        }
        setLoading(false);
    }

    React.useEffect(() => { fetchIssues(); }, [token]);

    const backlog = issues.filter(i => getColumn(i) === 'backlog');
    const inProgress = issues.filter(i => getColumn(i) === 'in_progress');
    const done = issues.filter(i => getColumn(i) === 'done');

    return (
        <div
            style={{
                minHeight: '100%',
                background: '#11111b',
                padding: '16px 24px 24px',
                display: 'flex',
                flexDirection: 'column',
                color: '#cdd6f4',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'transparent',
                        border: '1px solid #45475a',
                        color: '#a6adc8',
                        borderRadius: 6,
                        padding: '4px 12px',
                        fontSize: 13,
                        cursor: 'pointer',
                    }}
                >
                    ← Back
                </button>
                <div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#cdd6f4' }}>
                        Issue Tracker
                    </h2>
                    <p style={{ margin: 0, fontSize: 11, color: '#6c7086' }}>
                        {REPO}
                    </p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                        style={{
                            background: '#f9e2af33',
                            border: '1px solid #f9e2af',
                            color: '#f9e2af',
                            borderRadius: 6,
                            padding: '2px 8px',
                            fontSize: 11,
                            fontWeight: 600,
                        }}
                    >
                        DEV
                    </span>
                    <button
                        onClick={fetchIssues}
                        disabled={loading}
                        style={{
                            background: 'transparent',
                            border: '1px solid #45475a',
                            color: '#a6adc8',
                            borderRadius: 6,
                            padding: '4px 12px',
                            fontSize: 12,
                            cursor: 'pointer',
                        }}
                    >
                        {loading ? '...' : '↻ Refresh'}
                    </button>
                </div>
            </div>

            {/* Token config */}
            <div
                style={{
                    background: '#1e1e2e',
                    border: '1px solid #313244',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                }}
            >
                <span style={{ fontSize: 12, color: '#a6adc8', flexShrink: 0 }}>
                    GitHub Token:
                </span>
                <input
                    type="password"
                    placeholder="ghp_... (required for write actions)"
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                    style={{ ...inputStyle, flex: '1 1 200px', maxWidth: 300 }}
                />
                <button
                    onClick={() => setToken(tokenInput)}
                    style={btnStyle('#89b4fa')}
                >
                    Apply
                </button>
                <span style={{ fontSize: 11, color: '#6c7086' }}>
                    {token ? '● Connected' : '○ Read-only (no token)'}
                </span>
                <span style={{ fontSize: 11, color: '#45475a' }}>
                    Set VITE_GITHUB_TOKEN in .env.local to persist
                </span>
            </div>

            {/* Create issue */}
            {token && <CreateIssueForm token={token} onCreated={fetchIssues} />}

            {/* Error */}
            {error && (
                <div
                    style={{
                        background: '#f38ba833',
                        border: '1px solid #f38ba8',
                        borderRadius: 6,
                        padding: '8px 12px',
                        color: '#f38ba8',
                        fontSize: 12,
                        marginBottom: 16,
                    }}
                >
                    {error}
                </div>
            )}

            {/* Board */}
            <div
                style={{
                    display: 'flex',
                    gap: 20,
                    flex: 1,
                    overflowX: 'auto',
                    alignItems: 'flex-start',
                }}
            >
                <KanbanColumn
                    title="Backlog"
                    color="#89b4fa"
                    issues={backlog}
                    token={token}
                    onRefresh={fetchIssues}
                />
                <KanbanColumn
                    title="In Progress"
                    color="#f9e2af"
                    issues={inProgress}
                    token={token}
                    onRefresh={fetchIssues}
                />
                <KanbanColumn
                    title="Done"
                    color="#a6e3a1"
                    issues={done}
                    token={token}
                    onRefresh={fetchIssues}
                />
            </div>
        </div>
    );
}
