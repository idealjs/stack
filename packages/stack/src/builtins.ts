export { type AliasResolveOptions, aliasResolve } from './core/aliasResolve.ts'
export { type BundleOptions, bundle, moduleRuntime } from './core/bundle.ts'
export { withDefaultHooks } from './core/defaults.ts'
export { type ImportsOptions, imports } from './core/imports.ts'
export { type InlineScriptOptions, inlineScript } from './core/inlineScript.ts'
export { type MinifyOptions, minify } from './core/minify.ts'
export {
  browserStrategy,
  nodeStrategy,
  type PkgJson,
  type PkgStrategy,
} from './core/pkgJson.ts'
export { type PkgResolveOptions, pkgResolve } from './core/pkgResolve.ts'
export { type RelativeResolveOptions, relativeResolve } from './core/relativeResolve.ts'
export { stronglyConnected } from './core/scc.ts'
export { type VendorOptions, vendor } from './core/vendor.ts'
