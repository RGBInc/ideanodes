import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          name: 'IdeaNodes',
          short_name: 'IdeaNodes',
          description: 'Sequential thinking engine for lateral ideas.',
          theme_color: '#18181b',
          background_color: '#18181b',
          display: 'standalone',
          icons: [
            {
              src: 'icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            },
            {
              src: 'icon.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            },
            {
              src: 'icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ],
          orientation: 'portrait-primary',
          categories: ['productivity', 'utilities', 'creativity'],
          shortcuts: [
            {
              name: 'New Session',
              short_name: 'New',
              description: 'Start a new thinking session',
              url: '/'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
