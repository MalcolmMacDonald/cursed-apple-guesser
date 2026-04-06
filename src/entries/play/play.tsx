import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@/index.css';
import PageShell from '@/components/PageShell';
import LocationGuesserFlow from '@/games/location-guesser/LocationGuesserFlow';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PageShell>
            <LocationGuesserFlow/>
        </PageShell>
    </StrictMode>,
);
