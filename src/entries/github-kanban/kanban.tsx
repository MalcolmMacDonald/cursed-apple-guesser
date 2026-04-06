import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@/index.css';
import PageShell from '@/components/PageShell';
import {GithubKanban} from '@malcolmmacdonald/github-kanban';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PageShell>
            <GithubKanban
                repo="MalcolmMacDonald/cursed-apple-guesser"
                token={import.meta.env.GH_TOKEN}
                onBack={() => {
                    window.location.href = import.meta.env.BASE_URL;
                }}
                promoteWorkflow={{workflowFile: 'promote-to-prod.yml', ref: 'dev'}}
            />
        </PageShell>
    </StrictMode>,
);
