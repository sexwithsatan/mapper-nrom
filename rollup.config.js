import manifest from './package.json'
import resolve from 'rollup-plugin-node-resolve'
import {uglify} from 'rollup-plugin-uglify'

// npm run build -> {production} is true
// npm run dev -> {production} is false
const production = !process.env.ROLLUP_WATCH

export default {
  experimentalCodeSplitting: true,
  input: 'src/allocate.js',
  output: {
    file: manifest.module,
    format: 'es',
    sourcemap: true
  },
  plugins: [
    resolve()/*, // tells Rollup how to find node_modules
    production && uglify() // FIXME: minify, but only in production
                           // FIXME: need minifier plugin with ES6+ syntax
*/]
}
