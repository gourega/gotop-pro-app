// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Ajoutez cette ligne pour corriger le chemin des assets après le build
  base: '/', 
  build: {
    chunkSizeWarningLimit: 1000 // (Optionnel: pour masquer l'avertissement)
  }
})