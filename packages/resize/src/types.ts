import { Direction } from './resizer'

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


export interface NewSize {
  newHeight: number | string
  newWidth: number | string
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
export interface State {
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
