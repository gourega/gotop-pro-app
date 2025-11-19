// vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Déclarez la variable VITE_GEMINI_API_KEY comme étant de type string
  readonly VITE_GEMINI_API_KEY: string;
  // Ajoutez ici toutes vos autres variables VITE_... nécessaires
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}