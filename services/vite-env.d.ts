// vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Déclaration sans valeur
  readonly VITE_GEMINI_API_KEY: string;
  // Ajoutez ici toutes vos autres variables VITE_...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}