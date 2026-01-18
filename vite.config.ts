
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Use '' prefix to load all environment variables.
    const env = loadEnv(mode, process.cwd(), '');
    
    // Prioritize system environment variables (CI/GitHub Actions) over local .env files
    const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || "";

    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // This ensures code using process.env.API_KEY gets the actual value
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        // Polyfill process.env for broader compatibility
        'process.env': JSON.stringify({ 
          API_KEY: apiKey, 
          GEMINI_API_KEY: apiKey,
          NODE_ENV: mode 
        })
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
      }
    };
});
