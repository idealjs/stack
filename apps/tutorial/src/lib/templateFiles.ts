import indexHtmlRaw from '../../../../examples/template/index.html?raw'
import mainTsRaw from '../../../../examples/template/main.ts?raw'
import configRaw from '../../../../examples/template/esbuild.config.json?raw'

export const TEMPLATE_FILES = [
  { name: 'index.html', code: indexHtmlRaw },
  { name: 'main.ts', code: mainTsRaw },
  { name: 'esbuild.config.json', code: configRaw },
]
