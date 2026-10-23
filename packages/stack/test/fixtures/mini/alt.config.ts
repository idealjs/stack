export default {
  inputs: {
    main: 'src/main.ts',
  },
  outputs: [{ dir: 'dist/alt' }],
  alias: {
    '@/': 'src/',
  },
}
