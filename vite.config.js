import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
  
export default defineConfig(({ command, mode, isSsrBuild }) => ({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'Inventory System V2',
                short_name: 'Inventory',
                description: 'Advanced Inventory Management System',
                theme_color: '#4f46e5',
                icons: [
                    {
                        src: '/images/nmd_logo.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/images/nmd_logo.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        }),
    ],
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: isSsrBuild ? undefined : {
                    vendor: ['react', 'react-dom', 'framer-motion'],
                    icons: ['lucide-react'],
                    charts: ['chart.js', 'react-chartjs-2'],
                    query: ['@tanstack/react-query'],
                },
            },
        },
    },
}));
