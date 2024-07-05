import { createRequire } from 'module'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const require = createRequire(import.meta.url)

// Vite plugin to provide global variables
const ProvidePlugin = (vars: any) => {
  return {
    name: 'vite-plugin-provide',
    config(config: any) {
      if (!config.define) {
        config.define = {}
      }
      for (const key in vars) {
        config.define[key] = vars[key]
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
      buffer: resolve(require.resolve('buffer/').replace(/index\.js$/, '')),
      '@': resolve(__dirname, './src'),
    },
  },
  base: '/', // Specify the base public path
  build: {
    // minify: false,
    // terserOptions: {
    //   compress: false,
    //   mangle: false,
    // },
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
      // process: 'process/browser',
    }),
  ],
})
