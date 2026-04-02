import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt(
  {},
  {
    ignores: [
      '.nuxt/**',
      '.nuxt-build*/**',
      '.output/**',
      'dist/**',
    ],
  },
)
