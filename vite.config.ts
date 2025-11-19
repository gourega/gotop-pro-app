// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Cette ligne corrige le problème de chemin 404 pour Vercel en utilisant le chemin racine
  base: '/', 
  build: {
    // Ceci masque l'avertissement de taille de chunk vu précédemment (optionnel)
    chunkSizeWarningLimit: 1000 
  }
})