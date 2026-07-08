/**
 * @file Node.js fs/promises 模块的浏览器端空实现
 * 用于满足 vite-plugin-node-polyfills 或依赖中对 node:fs/promises 的引用，
 * 在浏览器环境中不会实际调用文件系统。
 */

export default {}
export const promises = {}
export const access = async () => {}
export const readFile = async () => new Uint8Array(0)
export const writeFile = async () => {}
export const mkdir = async () => {}
export const unlink = async () => {}
