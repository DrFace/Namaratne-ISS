import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
  
export default defineConfig(({ command, mode, isSsrBuild }) => ({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
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
