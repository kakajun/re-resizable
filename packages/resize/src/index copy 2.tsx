import * as React from 'react'
import { flushSync } from 'react-dom'

import { Resizer, Direction } from './resizer'

// 默认尺寸
const DEFAULT_SIZE = {
  width: 'auto',
  height: 'auto'
}

// 定义各种接口和类型
export type ResizeDirection = Direction

export interface Enable {
  top?: boolean
  right?: boolean
  bottom?: boolean
  left?: boolean
  topRight?: boolean
  bottomRight?: boolean
  bottomLeft?: boolean
  topLeft?: boolean
}

export interface HandleStyles {
  top?: React.CSSProperties
  right?: React.CSSProperties
  bottom?: React.CSSProperties
  left?: React.CSSProperties
  topRight?: React.CSSProperties
  bottomRight?: React.CSSProperties
  bottomLeft?: React.CSSProperties
  topLeft?: React.CSSProperties
}

export interface HandleClassName {
  top?: string
  right?: string
  bottom?: string
  left?: string
  topRight?: string
  bottomRight?: string
  bottomLeft?: string
  topLeft?: string
}

export interface Size {
  width?: string | number
  height?: string | number
}

export interface NumberSize {
  width: number
  height: number
}

export interface HandleComponent {
  top?: React.ReactElement<any>
  right?: React.ReactElement<any>
  bottom?: React.ReactElement<any>
  left?: React.ReactElement<any>
  topRight?: React.ReactElement<any>
  bottomRight?: React.ReactElement<any>
  bottomLeft?: React.ReactElement<any>
  topLeft?: React.ReactElement<any>
}

export type ResizeCallback = (
  event: MouseEvent | TouchEvent,
  direction: Direction,
  elementRef: HTMLElement,
  delta: NumberSize
) => void

export type ResizeStartCallback = (
  e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
  dir: Direction,
  elementRef: HTMLElement
) => void | boolean

// Resizable组件的属性接口
export interface ResizableProps {
  as?: string | React.ComponentType<any>
  style?: React.CSSProperties
  className?: string
  grid?: [number, number]
  gridGap?: [number, number]
  snap?: {
    x?: number[]
    y?: number[]
  }
  snapGap?: number
  bounds?: 'parent' | 'window' | HTMLElement
  boundsByDirection?: boolean
  size?: Size
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
  lockAspectRatio?: boolean | number
  lockAspectRatioExtraWidth?: number
  lockAspectRatioExtraHeight?: number
  enable?: Enable | false
  handleStyles?: HandleStyles
  handleClasses?: HandleClassName
  handleWrapperStyle?: React.CSSProperties
  handleWrapperClass?: string
  handleComponent?: HandleComponent
  children?: React.ReactNode
  onResizeStart?: ResizeStartCallback
  onResize?: ResizeCallback
  onResizeStop?: ResizeCallback
  defaultSize?: Size
  scale?: number
  resizeRatio?: number | [number, number]
}

// 组件的状态接口
interface State {
  isResizing: boolean
  direction: Direction
  original: {
    x: number
    y: number
    width: number
    height: number
  }
  width: number | string
  height: number | string
  backgroundStyle: React.CSSProperties
  flexBasis?: string | number
}

// 辅助函数：限制数值在[min, max]之间
const clamp = (n: number, min: number, max: number): number => Math.max(Math.min(n, max), min)

// 辅助函数：根据网格对齐数值
const snap = (n: number, size: number, gridGap: number): number => {
  const v = Math.round(n / size)
  return v * size + gridGap * (v - 1)
}

// 检查目标字符串中是否包含指定方向
const hasDirection = (dir: 'top' | 'right' | 'bottom' | 'left', target: string): boolean =>
  new RegExp(dir, 'i').test(target)

// 判断事件是否为触摸事件
const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => {
  return Boolean((event as TouchEvent).touches && (event as TouchEvent).touches.length)
}

// 判断事件是否为鼠标事件
const isMouseEvent = (event: MouseEvent | TouchEvent): event is MouseEvent => {
  return Boolean(
    ((event as MouseEvent).clientX || (event as MouseEvent).clientX === 0) &&
      ((event as MouseEvent).clientY || (event as MouseEvent).clientY === 0)
  )
}

// 找到最接近的对齐点
const findClosestSnap = (n: number, snapArray: number[], snapGap: number = 0): number => {
  const closestGapIndex = snapArray.reduce(
    (prev, curr, index) => (Math.abs(curr - n) < Math.abs(snapArray[prev] - n) ? index : prev),
    0
  )
  const gap = Math.abs(snapArray[closestGapIndex] - n)
  return snapGap === 0 || gap < snapGap ? snapArray[closestGapIndex] : n
}

// 将数值转换为字符串尺寸
const getStringSize = (n: number | string): string => {
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
const calculateNewMax = (
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
const normalizeToPair = <T,>(val: T | [T, T]): [T, T] => (Array.isArray(val) ? val : [val, val])

// 定义可识别的属性
const definedProps = [
  'as',
  'ref',
  'style',
  'className',
  'grid',
  'gridGap',
  'snap',
  'bounds',
  'boundsByDirection',
  'size',
  'defaultSize',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'lockAspectRatio',
  'lockAspectRatioExtraWidth',
  'lockAspectRatioExtraHeight',
  'enable',
  'handleStyles',
  'handleClasses',
  'handleWrapperStyle',
  'handleWrapperClass',
  'children',
  'onResizeStart',
  'onResize',
  'onResizeStop',
  'handleComponent',
  'scale',
  'resizeRatio',
  'snapGap'
]

// 基础类名，用于计算百分比尺寸
const baseClassName = '__resizable_base__'

// 声明全局接口
declare global {
  interface Window {
    MouseEvent: typeof MouseEvent
    TouchEvent: typeof TouchEvent
  }
}

interface NewSize {
  newHeight: number | string
  newWidth: number | string
}

// Resizable组件类
export class Resizable extends React.PureComponent<ResizableProps, State> {
  flexDir?: 'row' | 'column'

  // 获取父节点
  get parentNode(): HTMLElement | null {
    if (!this.resizable) {
      return null
    }
    return this.resizable.parentNode as HTMLElement
  }

  // 获取窗口对象
  get window(): Window | null {
    if (!this.resizable) {
      return null
    }
    if (!this.resizable.ownerDocument) {
      return null
    }
    return this.resizable.ownerDocument.defaultView as Window
  }

  // 获取组件的尺寸属性
  get propsSize(): Size {
    return this.props.size || this.props.defaultSize || DEFAULT_SIZE
  }

  // 获取当前尺寸
  get size(): NumberSize {
    let width = 0
    let height = 0
    if (this.resizable && this.window) {
      const orgWidth = this.resizable.offsetWidth
      const orgHeight = this.resizable.offsetHeight
      const orgPosition = this.resizable.style.position
      if (orgPosition !== 'relative') {
        this.resizable.style.position = 'relative'
      }
      width = this.resizable.style.width !== 'auto' ? this.resizable.offsetWidth : orgWidth
      height = this.resizable.style.height !== 'auto' ? this.resizable.offsetHeight : orgHeight
      this.resizable.style.position = orgPosition
    }
    return { width, height }
  }

  // 获取尺寸样式
  get sizeStyle(): { width: string; height: string } {
    const { size } = this.props

    const getSize = (key: 'width' | 'height'): string => {
      if (typeof this.state[key] === 'undefined' || this.state[key] === 'auto') {
        return 'auto'
      }
      if (this.propsSize && this.propsSize[key] && this.propsSize[key]?.toString().endsWith('%')) {
        if (this.state[key].toString().endsWith('%')) {
          return this.state[key].toString()
        }
        const parentSize = this.getParentSize()
        const value = Number(this.state[key].toString().replace('px', ''))
        const percent = (value / parentSize[key]) * 100
        return `${percent}%`
      }
      return getStringSize(this.state[key])
    }
    const width =
      size && typeof size.width !== 'undefined' && !this.state.isResizing
        ? getStringSize(size.width)
        : getSize('width')
    const height =
      size && typeof size.height !== 'undefined' && !this.state.isResizing
        ? getStringSize(size.height)
        : getSize('height')
    return { width, height }
  }

  // 默认属性
  public static defaultProps = {
    as: 'div',
    onResizeStart: () => {},
    onResize: () => {},
    onResizeStop: () => {},
    enable: {
      top: true,
      right: true,
      bottom: true,
      left: true,
      topRight: true,
      bottomRight: true,
      bottomLeft: true,
      topLeft: true
    },
    style: {},
    grid: [1, 1],
    gridGap: [0, 0],
    lockAspectRatio: false,
    lockAspectRatioExtraWidth: 0,
    lockAspectRatioExtraHeight: 0,
    scale: 1,
    resizeRatio: 1,
    snapGap: 0
  }

  ratio = 1
  resizable: HTMLElement | null = null
  parentLeft = 0
  parentTop = 0
  resizableLeft = 0
  resizableRight = 0
  resizableTop = 0
  resizableBottom = 0
  targetLeft = 0
  targetTop = 0

  constructor(props: ResizableProps) {
    super(props)
    this.state = {
      isResizing: false,
      width: this.propsSize?.width ?? 'auto',
      height: this.propsSize?.height ?? 'auto',
      direction: 'right',
      original: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      backgroundStyle: {
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0)',
        cursor: 'auto',
        opacity: 0,
        position: 'fixed',
        zIndex: 9999,
        top: '0',
        left: '0',
        bottom: '0',
        right: '0'
      },
      flexBasis: undefined
    }

    this.onResizeStart = this.onResizeStart.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }

  // 获取父节点尺寸
  getParentSize(): { width: number; height: number } {
    if (!this.parentNode) {
      if (!this.window) {
        return { width: 0, height: 0 }
      }
      return { width: this.window.innerWidth, height: this.window.innerHeight }
    }
    const base = this.appendBase()
    if (!base) {
      return { width: 0, height: 0 }
    }
    let wrapChanged = false
    const wrap = this.parentNode.style.flexWrap
    if (wrap !== 'wrap') {
      wrapChanged = true
      this.parentNode.style.flexWrap = 'wrap'
    }
    base.style.position = 'relative'
    base.style.minWidth = '100%'
    base.style.minHeight = '100%'
    const size = {
      width: base.offsetWidth,
      height: base.offsetHeight
    }
    if (wrapChanged) {
      this.parentNode.style.flexWrap = wrap
    }
    this.removeBase(base)
    return size
  }

  // 绑定事件
  bindEvents() {
    if (this.window) {
      this.window.addEventListener('mouseup', this.onMouseUp)
      this.window.addEventListener('mousemove', this.onMouseMove)
      this.window.addEventListener('mouseleave', this.onMouseUp)
      this.window.addEventListener('touchmove', this.onMouseMove, {
        capture: true,
        passive: false
      })
      this.window.addEventListener('touchend', this.onMouseUp)
    }
  }

  // 解绑事件
  unbindEvents() {
    if (this.window) {
      this.window.removeEventListener('mouseup', this.onMouseUp)
      this.window.removeEventListener('mousemove', this.onMouseMove)
      this.window.removeEventListener('mouseleave', this.onMouseUp)
      this.window.removeEventListener('touchmove', this.onMouseMove, true)
      this.window.removeEventListener('touchend', this.onMouseUp)
    }
  }

  // 组件挂载后
  componentDidMount() {
    if (!this.resizable || !this.window) {
      return
    }
    const computedStyle = this.window.getComputedStyle(this.resizable)
    this.setState({
      width: this.state.width || this.size.width,
      height: this.state.height || this.size.height,
      flexBasis: computedStyle.flexBasis !== 'auto' ? computedStyle.flexBasis : undefined
    })
  }

  // 添加基础元素
  appendBase = () => {
    if (!this.resizable || !this.window) {
      return null
    }
    const parent = this.parentNode
    if (!parent) {
      return null
    }
    const element = this.window.document.createElement('div')
    element.style.width = '100%'
    element.style.height = '100%'
    element.style.position = 'absolute'
    element.style.transform = 'scale(0, 0)'
    element.style.left = '0'
    element.style.flex = '0 0 100%'
    if (element.classList) {
      element.classList.add(baseClassName)
    } else {
      element.className += baseClassName
    }
    parent.appendChild(element)
    return element
  }

  // 移除基础元素
  removeBase = (base: HTMLElement) => {
    const parent = this.parentNode
    if (!parent) {
      return
    }
    parent.removeChild(base)
  }

  // 组件卸载前
  componentWillUnmount() {
    if (this.window) {
      this.unbindEvents()
    }
  }

  // 为CSS属性创建尺寸
  createSizeForCssProperty(newSize: number | string, kind: 'width' | 'height'): number | string {
    const propsSize = this.propsSize && this.propsSize[kind]
    return this.state[kind] === 'auto' &&
      this.state.original[kind] === newSize &&
      (typeof propsSize === 'undefined' || propsSize === 'auto')
      ? 'auto'
      : newSize
  }

  // 从边界计算新的最大尺寸
  calculateNewMaxFromBoundary(maxWidth?: number, maxHeight?: number) {
    const { boundsByDirection } = this.props
    const { direction } = this.state
    const widthByDirection = boundsByDirection && hasDirection('left', direction)
    const heightByDirection = boundsByDirection && hasDirection('top', direction)
    let boundWidth
    let boundHeight
    if (this.props.bounds === 'parent') {
      const parent = this.parentNode
      if (parent) {
        boundWidth = widthByDirection
          ? this.resizableRight - this.parentLeft
          : parent.offsetWidth + (this.parentLeft - this.resizableLeft)
        boundHeight = heightByDirection
          ? this.resizableBottom - this.parentTop
          : parent.offsetHeight + (this.parentTop - this.resizableTop)
      }
    } else if (this.props.bounds === 'window') {
      if (this.window) {
        boundWidth = widthByDirection
          ? this.resizableRight
          : this.window.innerWidth - this.resizableLeft
        boundHeight = heightByDirection
          ? this.resizableBottom
          : this.window.innerHeight - this.resizableTop
      }
    } else if (this.props.bounds) {
      boundWidth = widthByDirection
        ? this.resizableRight - this.targetLeft
        : this.props.bounds.offsetWidth + (this.targetLeft - this.resizableLeft)
      boundHeight = heightByDirection
        ? this.resizableBottom - this.targetTop
        : this.props.bounds.offsetHeight + (this.targetTop - this.resizableTop)
    }
    if (boundWidth && Number.isFinite(boundWidth)) {
      maxWidth = maxWidth && maxWidth < boundWidth ? maxWidth : boundWidth
    }
    if (boundHeight && Number.isFinite(boundHeight)) {
      maxHeight = maxHeight && maxHeight < boundHeight ? maxHeight : boundHeight
    }
    return { maxWidth, maxHeight }
  }

  // 根据方向计算新的尺寸
  calculateNewSizeFromDirection(clientX: number, clientY: number) {
    const scale = this.props.scale || 1
    const [resizeRatioX, resizeRatioY] = normalizeToPair(this.props.resizeRatio || 1)
    const { direction, original } = this.state
    const { lockAspectRatio, lockAspectRatioExtraHeight, lockAspectRatioExtraWidth } = this.props
    let newWidth = original.width
    let newHeight = original.height
    const extraHeight = lockAspectRatioExtraHeight || 0
    const extraWidth = lockAspectRatioExtraWidth || 0
    if (hasDirection('right', direction)) {
      newWidth = original.width + ((clientX - original.x) * resizeRatioX) / scale
      if (lockAspectRatio) {
        newHeight = (newWidth - extraWidth) / this.ratio + extraHeight
      }
    }
    if (hasDirection('left', direction)) {
      newWidth = original.width - ((clientX - original.x) * resizeRatioX) / scale
      if (lockAspectRatio) {
        newHeight = (newWidth - extraWidth) / this.ratio + extraHeight
      }
    }
    if (hasDirection('bottom', direction)) {
      newHeight = original.height + ((clientY - original.y) * resizeRatioY) / scale
      if (lockAspectRatio) {
        newWidth = (newHeight - extraHeight) * this.ratio + extraWidth
      }
    }
    if (hasDirection('top', direction)) {
      newHeight = original.height - ((clientY - original.y) * resizeRatioY) / scale
      if (lockAspectRatio) {
        newWidth = (newHeight - extraHeight) * this.ratio + extraWidth
      }
    }
    return { newWidth, newHeight }
  }

  // 根据长宽比计算新的尺寸
  calculateNewSizeFromAspectRatio(
    newWidth: number,
    newHeight: number,
    max: { width?: number; height?: number },
    min: { width?: number; height?: number }
  ) {
    const { lockAspectRatio, lockAspectRatioExtraHeight, lockAspectRatioExtraWidth } = this.props
    const computedMinWidth = typeof min.width === 'undefined' ? 10 : min.width
    const computedMaxWidth =
      typeof max.width === 'undefined' || max.width < 0 ? newWidth : max.width
    const computedMinHeight = typeof min.height === 'undefined' ? 10 : min.height
    const computedMaxHeight =
      typeof max.height === 'undefined' || max.height < 0 ? newHeight : max.height
    const extraHeight = lockAspectRatioExtraHeight || 0
    const extraWidth = lockAspectRatioExtraWidth || 0
    if (lockAspectRatio) {
      const extraMinWidth = (computedMinHeight - extraHeight) * this.ratio + extraWidth
      const extraMaxWidth = (computedMaxHeight - extraHeight) * this.ratio + extraWidth
      const extraMinHeight = (computedMinWidth - extraWidth) / this.ratio + extraHeight
      const extraMaxHeight = (computedMaxWidth - extraWidth) / this.ratio + extraHeight
      const lockedMinWidth = Math.max(computedMinWidth, extraMinWidth)
      const lockedMaxWidth = Math.min(computedMaxWidth, extraMaxWidth)
      const lockedMinHeight = Math.max(computedMinHeight, extraMinHeight)
      const lockedMaxHeight = Math.min(computedMaxHeight, extraMaxHeight)
      newWidth = clamp(newWidth, lockedMinWidth, lockedMaxWidth)
      newHeight = clamp(newHeight, lockedMinHeight, lockedMaxHeight)
    } else {
      newWidth = clamp(newWidth, computedMinWidth, computedMaxWidth)
      newHeight = clamp(newHeight, computedMinHeight, computedMaxHeight)
    }
    return { newWidth, newHeight }
  }

  // 设置边界的客户端矩形
  setBoundingClientRect() {
    const adjustedScale = 1 / (this.props.scale || 1)

    // 对于父边界
    if (this.props.bounds === 'parent') {
      const parent = this.parentNode
      if (parent) {
        const parentRect = parent.getBoundingClientRect()
        this.parentLeft = parentRect.left * adjustedScale
        this.parentTop = parentRect.top * adjustedScale
      }
    }

    // 对于目标（html元素）边界
    if (this.props.bounds && typeof this.props.bounds !== 'string') {
      const targetRect = this.props.bounds.getBoundingClientRect()
      this.targetLeft = targetRect.left * adjustedScale
      this.targetTop = targetRect.top * adjustedScale
    }

    // 对于边界
    if (this.resizable) {
      const { left, top, right, bottom } = this.resizable.getBoundingClientRect()
      this.resizableLeft = left * adjustedScale
      this.resizableRight = right * adjustedScale
      this.resizableTop = top * adjustedScale
      this.resizableBottom = bottom * adjustedScale
    }
  }

  // 开始调整大小
  onResizeStart(
    event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
    direction: Direction
  ) {
    if (!this.resizable || !this.window) {
      return
    }
    let clientX = 0
    let clientY = 0
    if (event.nativeEvent && isMouseEvent(event.nativeEvent)) {
      clientX = event.nativeEvent.clientX
      clientY = event.nativeEvent.clientY
    } else if (event.nativeEvent && isTouchEvent(event.nativeEvent)) {
      clientX = (event.nativeEvent as TouchEvent).touches[0].clientX
      clientY = (event.nativeEvent as TouchEvent).touches[0].clientY
    }
    if (this.props.onResizeStart) {
      if (this.resizable) {
        const startResize = this.props.onResizeStart(event, direction, this.resizable)
        if (startResize === false) {
          return
        }
      }
    }

    // 修复 #168
    if (this.props.size) {
      if (
        typeof this.props.size.height !== 'undefined' &&
        this.props.size.height !== this.state.height
      ) {
        this.setState({ height: this.props.size.height })
      }
      if (
        typeof this.props.size.width !== 'undefined' &&
        this.props.size.width !== this.state.width
      ) {
        this.setState({ width: this.props.size.width })
      }
    }

    // 对于锁定长宽比的情况
    this.ratio =
      typeof this.props.lockAspectRatio === 'number'
        ? this.props.lockAspectRatio
        : this.size.width / this.size.height

    let flexBasis
    const computedStyle = this.window.getComputedStyle(this.resizable)
    if (computedStyle.flexBasis !== 'auto') {
      const parent = this.parentNode
      if (parent) {
        const dir = this.window.getComputedStyle(parent).flexDirection
        this.flexDir = dir.startsWith('row') ? 'row' : 'column'
        flexBasis = computedStyle.flexBasis
      }
    }
    // 对于边界
    this.setBoundingClientRect()
    this.bindEvents()
    const state = {
      original: {
        x: clientX,
        y: clientY,
        width: this.size.width,
        height: this.size.height
      },
      isResizing: true,
      backgroundStyle: {
        ...this.state.backgroundStyle,
        cursor: this.window.getComputedStyle(event.target as HTMLElement).cursor || 'auto'
      },
      direction,
      flexBasis
    }

    this.setState(state)
  }

  // 鼠标移动事件
  onMouseMove(event: MouseEvent | TouchEvent) {
    if (!this.state.isResizing || !this.resizable || !this.window) {
      return
    }
    if (this.window.TouchEvent && isTouchEvent(event)) {
      try {
        event.preventDefault()
        event.stopPropagation()
      } catch (e) {
        // 忽略失败
      }
    }
    let { maxWidth, maxHeight, minWidth, minHeight } = this.props
    const clientX = isTouchEvent(event) ? event.touches[0].clientX : event.clientX
    const clientY = isTouchEvent(event) ? event.touches[0].clientY : event.clientY
    const { direction, original, width, height } = this.state
    const parentSize = this.getParentSize()
    const max = calculateNewMax(
      parentSize,
      this.window.innerWidth,
      this.window.innerHeight,
      maxWidth,
      maxHeight,
      minWidth,
      minHeight
    )

    maxWidth = max.maxWidth
    maxHeight = max.maxHeight
    minWidth = max.minWidth
    minHeight = max.minHeight

    // 计算新尺寸
    let { newHeight, newWidth }: NewSize = this.calculateNewSizeFromDirection(clientX, clientY)

    // 从边界设置计算最大尺寸
    const boundaryMax = this.calculateNewMaxFromBoundary(maxWidth, maxHeight)

    if (this.props.snap && this.props.snap.x) {
      newWidth = findClosestSnap(newWidth, this.props.snap.x, this.props.snapGap)
    }
    if (this.props.snap && this.props.snap.y) {
      newHeight = findClosestSnap(newHeight, this.props.snap.y, this.props.snapGap)
    }

    // 从长宽比计算新尺寸
    const newSize = this.calculateNewSizeFromAspectRatio(
      newWidth,
      newHeight,
      { width: boundaryMax.maxWidth, height: boundaryMax.maxHeight },
      { width: minWidth, height: minHeight }
    )
    newWidth = newSize.newWidth
    newHeight = newSize.newHeight

    if (this.props.grid) {
      const newGridWidth = snap(
        newWidth,
        this.props.grid[0],
        this.props.gridGap ? this.props.gridGap[0] : 0
      )
      const newGridHeight = snap(
        newHeight,
        this.props.grid[1],
        this.props.gridGap ? this.props.gridGap[1] : 0
      )
      const gap = this.props.snapGap || 0
      const w = gap === 0 || Math.abs(newGridWidth - newWidth) <= gap ? newGridWidth : newWidth
      const h = gap === 0 || Math.abs(newGridHeight - newHeight) <= gap ? newGridHeight : newHeight
      newWidth = w
      newHeight = h
    }

    const delta = {
      width: newWidth - original.width,
      height: newHeight - original.height
    }

    if (width && typeof width === 'string') {
      if (width.endsWith('%')) {
        const percent = (newWidth / parentSize.width) * 100
        newWidth = `${percent}%`
      } else if (width.endsWith('vw')) {
        const vw = (newWidth / this.window.innerWidth) * 100
        newWidth = `${vw}vw`
      } else if (width.endsWith('vh')) {
        const vh = (newWidth / this.window.innerHeight) * 100
        newWidth = `${vh}vh`
      }
    }

    if (height && typeof height === 'string') {
      if (height.endsWith('%')) {
        const percent = (newHeight / parentSize.height) * 100
        newHeight = `${percent}%`
      } else if (height.endsWith('vw')) {
        const vw = (newHeight / this.window.innerWidth) * 100
        newHeight = `${vw}vw`
      } else if (height.endsWith('vh')) {
        const vh = (newHeight / this.window.innerHeight) * 100
        newHeight = `${vh}vh`
      }
    }

    const newState: {
      width: string | number
      height: string | number
      flexBasis?: string | number
    } = {
      width: this.createSizeForCssProperty(newWidth, 'width'),
      height: this.createSizeForCssProperty(newHeight, 'height')
    }

    if (this.flexDir === 'row') {
      newState.flexBasis = newState.width
    } else if (this.flexDir === 'column') {
      newState.flexBasis = newState.height
    }

    const widthChanged = this.state.width !== newState.width
    const heightChanged = this.state.height !== newState.height
    const flexBaseChanged = this.state.flexBasis !== newState.flexBasis
    const changed = widthChanged || heightChanged || flexBaseChanged

    if (changed) {
      // 对于v18，更新状态同步
      flushSync(() => {
        this.setState(newState)
      })
    }

    if (this.props.onResize) {
      if (changed) {
        this.props.onResize(event, direction, this.resizable, delta)
      }
    }
  }

  // 鼠标抬起事件
  onMouseUp(event: MouseEvent | TouchEvent) {
    const { isResizing, direction, original } = this.state
    if (!isResizing || !this.resizable) {
      return
    }
    const delta = {
      width: this.size.width - original.width,
      height: this.size.height - original.height
    }
    if (this.props.onResizeStop) {
      this.props.onResizeStop(event, direction, this.resizable, delta)
    }
    if (this.props.size) {
      this.setState({
        width: this.props.size.width ?? 'auto',
        height: this.props.size.height ?? 'auto'
      })
    }
    this.unbindEvents()
    this.setState({
      isResizing: false,
      backgroundStyle: { ...this.state.backgroundStyle, cursor: 'auto' }
    })
  }

  // 更新尺寸
  updateSize(size: Size) {
    this.setState({ width: size.width ?? 'auto', height: size.height ?? 'auto' })
  }

  // 渲染调整器
  renderResizer() {
    const {
      enable,
      handleStyles,
      handleClasses,
      handleWrapperStyle,
      handleWrapperClass,
      handleComponent
    } = this.props
    if (!enable) {
      return null
    }
    const resizers = Object.keys(enable).map((dir) => {
      if (enable[dir as Direction] !== false) {
        return (
          <Resizer
            key={dir}
            direction={dir as Direction}
            onResizeStart={this.onResizeStart}
            replaceStyles={handleStyles && handleStyles[dir as Direction]}
            className={handleClasses && handleClasses[dir as Direction]}
          >
            {handleComponent && handleComponent[dir as Direction]
              ? handleComponent[dir as Direction]
              : null}
          </Resizer>
        )
      }
      return null
    })
    // #93 将调整框包裹在span中（不会破坏100%宽度/高度）
    return (
      <div className={handleWrapperClass} style={handleWrapperStyle}>
        {resizers}
      </div>
    )
  }

  // 渲染组件
  render() {
    const extendsProps = Object.keys(this.props).reduce(
      (acc, key) => {
        if (definedProps.indexOf(key) !== -1) {
          return acc
        }
        acc[key] = this.props[key as keyof ResizableProps]
        return acc
      },
      {} as { [key: string]: any }
    )

    const style: React.CSSProperties = {
      position: 'relative',
      userSelect: this.state.isResizing ? 'none' : 'auto',
      ...this.props.style,
      ...this.sizeStyle,
      maxWidth: this.props.maxWidth,
      maxHeight: this.props.maxHeight,
      minWidth: this.props.minWidth,
      minHeight: this.props.minHeight,
      boxSizing: 'border-box',
      flexShrink: 0
    }

    if (this.state.flexBasis) {
      style.flexBasis = this.state.flexBasis
    }

    const Wrapper = this.props.as || 'div'

    return (
      <Wrapper
        style={style}
        className={this.props.className}
        {...extendsProps}
        ref={(c: HTMLElement | null) => {
          if (c) {
            this.resizable = c
          }
        }}
      >
        {this.state.isResizing && <div style={this.state.backgroundStyle} />}
        {this.props.children}
        {this.renderResizer()}
      </Wrapper>
    )
  }
}
