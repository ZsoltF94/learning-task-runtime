/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REMOTE_TASKS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
