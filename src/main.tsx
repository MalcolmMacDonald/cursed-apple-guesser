#!/usr/bin/env bun

import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import PageShell from './components/PageShell'
import HubScreen from './screens/hub/index.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PageShell>
            <HubScreen/>
        </PageShell>
    </StrictMode>,
)
