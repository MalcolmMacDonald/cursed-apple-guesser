import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

import {resolve} from 'node:path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: process.env.VITE_BASE_PATH ?? '/',
    publicDir: 'public',
    assetsInclude: ['**/*.png'],
    define: {
        __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    server: {},
    build: {
        rolldownOptions: {
            input: {
                main: resolve(import.meta.dirname, 'index.html'),
                play: resolve(import.meta.dirname, 'play/index.html'),
                'smoke-ranking': resolve(import.meta.dirname, 'smoke-ranking/index.html'),
                kanban: resolve(import.meta.dirname, 'dev/issue-tracker/index.html'),
            }
        }
    }
})


