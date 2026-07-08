/**
 * @file 通用工具函数
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并 Tailwind CSS 类名，处理条件类和冲突类。
 * 使用 clsx 处理条件合并，tailwind-merge 解决类名冲突。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
