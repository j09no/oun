import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePluginCartographer } from '@replit/vite-plugin-cartographer'
import { runtimeErrorPlugin } from '@replit/vite-plugin-runtime-error-modal'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Add cartographer for better source mapping
    vitePluginCartographer(),
    // Add runtime error modal for better debugging
    runtimeErrorPlugin(),
    // Add Tailwind CSS support
    tailwindcss(),
  ],
  // Base URL for GitHub Pages deployment
  base: '/oun/',
  
  // Server configuration
  server: {
    port: 3000,
    proxy: {
      // Proxy API requests to your Express backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'radix-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
          ],
        },
      },
    },
  },

  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@server': path.resolve(__dirname, './server'),
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'wouter',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'clsx',
      'tailwind-merge',
    ],
  },

  // Environment variables configuration
  envDir: '.',
  envPrefix: 'VITE_',
})
