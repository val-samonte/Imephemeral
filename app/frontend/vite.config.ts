import { createRequire } from 'module'
import path, { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const require = createRequire(import.meta.url)

// Vite plugin to provide global variables
const ProvidePlugin = (vars: Record<string, string[]>) => {
  return {
    name: 'vite-plugin-provide',
    config(config: any) {
      if (!config.define) {
        config.define = {}
      }
      for (const key in vars) {
        config.define[key] = JSON.stringify(vars[key])
      }
    },
  }
}

export default defineConfig({
  resolve: {
    alias: {
      http: resolve(require.resolve('stream-http')),
      https: resolve(require.resolve('https-browserify')),
      crypto: resolve(require.resolve('crypto-browserify')),
      stream: resolve(require.resolve('stream-browserify')),
      buffer: path.resolve(__dirname, 'node_modules/buffer/'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/', // Specify the base public path
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (/Failed to parse source map/.test(warning.message)) {
          return
        }
        warn(warning)
      },
    },
  },
  plugins: [
    react(),
    ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
})
