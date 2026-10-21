import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          timetable: path.resolve(__dirname, 'pages/timetable.html'),
          attendance: path.resolve(__dirname, 'pages/attendance.html'),
          results: path.resolve(__dirname, 'pages/results.html'),
          faculty: path.resolve(__dirname, 'pages/faculty.html'),
          login: path.resolve(__dirname, 'pages/login.html'),
        },
      },
    },
    server: {
      port: 3001,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
