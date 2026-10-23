export default {
  inputs: {
    main: 'src/main.ts',
  },
  outputs: [{ dir: 'dist/esm' }],
  alias: {
    '@/': 'src/',
  },
}
