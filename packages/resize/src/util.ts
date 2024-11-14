// 辅助函数：限制数值在[min, max]之间
export const clamp = (n: number, min: number, max: number): number =>
  Math.max(Math.min(n, max), min)

// 辅助函数：根据网格对齐数值
export const snap = (n: number, size: number, gridGap: number): number => {
  const v = Math.round(n / size)
  return v * size + gridGap * (v - 1)
}

// 检查目标字符串中是否包含指定方向
export const hasDirection = (dir: 'top' | 'right' | 'bottom' | 'left', target: string): boolean =>
  new RegExp(dir, 'i').test(target)

// 判断事件是否为触摸事件
export const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => {
  return Boolean((event as TouchEvent).touches && (event as TouchEvent).touches.length)
}

// 判断事件是否为鼠标事件
export const isMouseEvent = (event: MouseEvent | TouchEvent): event is MouseEvent => {
  return Boolean(
    ((event as MouseEvent).clientX || (event as MouseEvent).clientX === 0) &&
      ((event as MouseEvent).clientY || (event as MouseEvent).clientY === 0)
  )
}

// 找到最接近的对齐点
export const findClosestSnap = (n: number, snapArray: number[], snapGap: number = 0): number => {
  const closestGapIndex = snapArray.reduce(
    (prev, curr, index) => (Math.abs(curr - n) < Math.abs(snapArray[prev] - n) ? index : prev),
    0
  )
  const gap = Math.abs(snapArray[closestGapIndex] - n)
  return snapGap === 0 || gap < snapGap ? snapArray[closestGapIndex] : n
}

// 将数值转换为字符串尺寸
export const getStringSize = (n: number | string): string => {
  n = n.toString()
  if (n === 'auto') {
    return n
  }
  if (n.endsWith('px')) {
    return n
  }
  if (n.endsWith('%')) {
    return n
  }
  if (n.endsWith('vh')) {
    return n
  }
  if (n.endsWith('vw')) {
    return n
  }
  if (n.endsWith('vmax')) {
    return n
  }
  if (n.endsWith('vmin')) {
    return n
  }
  return `${n}px`
}

// 将字符串尺寸转换为像素尺寸
 const getPixelSize = (
  size: undefined | string | number,
  parentSize: number,
  innerWidth: number,
  innerHeight: number
) => {
  if (size && typeof size === 'string') {
    if (size.endsWith('px')) {
      return Number(size.replace('px', ''))
    }
    if (size.endsWith('%')) {
      const ratio = Number(size.replace('%', '')) / 100
      return parentSize * ratio
    }
    if (size.endsWith('vw')) {
      const ratio = Number(size.replace('vw', '')) / 100
      return innerWidth * ratio
    }
    if (size.endsWith('vh')) {
      const ratio = Number(size.replace('vh', '')) / 100
      return innerHeight * ratio
    }
  }
  return size
}

// 计算新的最大尺寸
export const calculateNewMax = (
  parentSize: { width: number; height: number },
  innerWidth: number,
  innerHeight: number,
  maxWidth?: string | number,
  maxHeight?: string | number,
  minWidth?: string | number,
  minHeight?: string | number
) => {
  maxWidth = getPixelSize(maxWidth, parentSize.width, innerWidth, innerHeight)
  maxHeight = getPixelSize(maxHeight, parentSize.height, innerWidth, innerHeight)
  minWidth = getPixelSize(minWidth, parentSize.width, innerWidth, innerHeight)
  minHeight = getPixelSize(minHeight, parentSize.height, innerWidth, innerHeight)
  return {
    maxWidth: typeof maxWidth === 'undefined' ? undefined : Number(maxWidth),
    maxHeight: typeof maxHeight === 'undefined' ? undefined : Number(maxHeight),
    minWidth: typeof minWidth === 'undefined' ? undefined : Number(minWidth),
    minHeight: typeof minHeight === 'undefined' ? undefined : Number(minHeight)
  }
}

// 将单个值或数组转换为数组
export const normalizeToPair = <T>(val: T | [T, T]): [T, T] =>
  Array.isArray(val) ? val : [val, val]
