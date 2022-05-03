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
  entryPoints: ['./src/main.js'],
  outdir: './dist',
}).then(typesGenerator())
