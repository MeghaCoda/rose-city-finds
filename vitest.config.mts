import { defineConfig, coverageConfigDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        // Framework/build config — not application logic, nothing to unit test.
        'next.config.ts',
        'postcss.config.mjs',
        // Generated/hand-written type declarations — no runtime behavior.
        'types/**',
      ],
    },
  },
})
