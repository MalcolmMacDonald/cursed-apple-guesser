import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@/index.css';
import PageShell from '@/components/PageShell';
import KanbanScreen from '@/screens/kanban/index.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PageShell>
            <KanbanScreen onBack={() => {
                window.location.href = import.meta.env.BASE_URL;
            }}/>
        </PageShell>
    </StrictMode>,
);
