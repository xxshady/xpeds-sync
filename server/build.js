import process from 'process'
import { build } from 'esbuild'
import { 
  getSharedBuildOptions, 
  typesGenerator 
} from '../build-src/shared-options'

const sharedOptions = getSharedBuildOptions(process)

build({
  ...sharedOptions,
  format: 'esm',
  platform: 'node',
  entryPoints: ['./src/main.js'],
  outdir: './dist',
  external: [
    ...sharedOptions.external,
    'alt-server',
    'altv-xsync-entity-server'
  ],
}).then(typesGenerator())
