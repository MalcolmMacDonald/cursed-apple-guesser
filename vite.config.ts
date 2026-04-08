import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'path'
import {cpSync, rmSync, existsSync, readFileSync} from 'fs'

const root = import.meta.dirname;
const src = resolve(root, 'src');

const entryPages: Record<string, string> = {
    play: resolve(src, 'entries/play/index.html'),
    'smoke-ranking': resolve(src, 'entries/smoke-ranking/index.html'),
    'github-kanban': resolve(src, 'entries/github-kanban/index.html'),
};

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        {
            // In dev, serve /play/, /smoke-ranking/, /github-kanban/ from src/entries/
            // (simple req.url rewrite doesn't work because Vite's SPA fallback runs first)
            name: 'mpa-dev-serve',
            configureServer(server) {
                server.middlewares.use(async (req, res, next) => {
                    const url = (req.url ?? '').split('?')[0].split('#')[0];
                    for (const [key, htmlPath] of Object.entries(entryPages)) {
                        if (url === `/${key}`) {
                            res.statusCode = 301;
                            res.setHeader('Location', `/${key}/`);
                            res.end();
                            return;
                        }
                        if (url === `/${key}/`) {
                            const rawHtml = readFileSync(htmlPath, 'utf-8');
                            const html = await server.transformIndexHtml(url, rawHtml, req.originalUrl);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'text/html; charset=utf-8');
                            res.end(html);
                            return;
                        }
                        // Rewrite sub-path requests (e.g. /github-kanban/kanban.tsx) to
                        // their actual source location so Vite can transform them.
                        if (url.startsWith(`/${key}/`)) {
                            req.url = `/src/entries${url}`;
                            return next();
                        }
                    }
                    next();
                });
            },
        },
        {
            // After build, move dist/src/entries/X/ → dist/X/ so URLs match
            name: 'mpa-build-move-html',
            closeBundle() {
                for (const key of Object.keys(entryPages)) {
                    const from = resolve(root, `dist/src/entries/${key}`);
                    const to = resolve(root, `dist/${key}`);
                    if (existsSync(from)) {
                        cpSync(from, to, {recursive: true});
                        rmSync(from, {recursive: true});
                    }
                }
            },
        },
    ],
    base: process.env.VITE_BASE_PATH ?? '/',
    publicDir: 'public',
    assetsInclude: ['**/*.png'],
    define: {
        __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    server: {},
    optimizeDeps: {
        exclude: ['@malcolmmacdonald/github-kanban'],
    },
    build: {
        rolldownOptions: {
            cwd: root,
            input: {
                main: resolve(root, 'index.html'),
                ...entryPages,
            }
        }
    },
    resolve: {
        alias: {
            '@': src,
        }
    }
})
