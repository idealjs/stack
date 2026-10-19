/** @stack/playground 对外包面：教程站（或其他宿主应用）经此导入沙箱宿主组件。
 * 本应用自身不再有独立页面入口——host UI 以组件形态被宿主应用装配，
 * 运行时文档（playground-runtime/）由 dev:runtime / build:runtime 独立源部署。 */
export { Playground } from './playground/Playground'
export { PROTOCOL_VERSION, isRuntimeMessage } from './playground/protocol'
export type { ConsoleLevel } from './playground/protocol'
