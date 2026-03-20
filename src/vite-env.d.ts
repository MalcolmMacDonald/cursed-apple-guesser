/// <reference types="vite/client" />

declare const __BUILD_TIME__: string;

interface ImportMetaEnv {
    readonly VITE_BASE_PATH?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
