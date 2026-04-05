import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '../index.css';
import PageShell from '../components/PageShell';
import SmokeRankingFlow from '../games/smoke-ranking/SmokeRankingFlow';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PageShell>
            <SmokeRankingFlow/>
        </PageShell>
    </StrictMode>,
);
