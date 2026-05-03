import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { cpSync, existsSync } from 'fs'

/**
 * Plugin que copia assets estáticos (images, favicon, etc.) para dist/ após o build.
 * Necessário porque quando root='public', o Vite não copia automaticamente
 * os arquivos estáticos que não são importados via JS/CSS.
 */
function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const publicDir = resolve(__dirname, 'public')
      const distDir = resolve(__dirname, 'dist')

      // Copia a pasta de imagens (ícones, logos, backgrounds)
      if (existsSync(resolve(publicDir, 'images'))) {
        cpSync(resolve(publicDir, 'images'), resolve(distDir, 'images'), { recursive: true })
      }

      // Copia o favicon
      if (existsSync(resolve(publicDir, 'favicon.svg'))) {
        cpSync(resolve(publicDir, 'favicon.svg'), resolve(distDir, 'favicon.svg'))
      }

      // Copia outros SVGs
      if (existsSync(resolve(publicDir, 'icons.svg'))) {
        cpSync(resolve(publicDir, 'icons.svg'), resolve(distDir, 'icons.svg'))
      }

      console.log('✅ Assets estáticos copiados para dist/')
    },
  }
}

export default defineConfig({
  root: 'public',
  publicDir: false,
  plugins: [
    react(),
    tailwindcss(),
    copyStaticAssets(),
  ],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '/src': resolve(__dirname, 'src'),
    },
  },
})
