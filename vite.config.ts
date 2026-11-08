import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

const devOrigin = 'http://127.0.0.1:5173';

export default defineConfig(({ mode }) => {
  const { WP_ORIGIN = 'http://localhost:8000' } = loadEnv(mode, process.cwd(), 'WP_');

  return {
    base: './',
    appType: 'custom',
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      origin: devOrigin,
      cors: { origin: new URL(WP_ORIGIN).origin },
    },
    plugins: [
      tailwindcss(),
      {
        name: 'wordpress-php-reload',
        handleHotUpdate({ file, server }) {
          if (!file.endsWith('.php')) return;

          server.ws.send({ type: 'full-reload', path: '*' });
          return [];
        },
      },
    ],
    build: {
      manifest: true,
      rolldownOptions: {
        input: 'src/index.ts',
      },
    },
  };
});
