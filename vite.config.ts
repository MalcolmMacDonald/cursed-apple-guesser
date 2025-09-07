import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/cursed-apple-guesser/',
    publicDir: 'public',
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            'public': resolve(__dirname, 'public'),
        }
    }
})


