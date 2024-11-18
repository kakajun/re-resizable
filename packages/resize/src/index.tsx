import React, { useCallback, useState, useRef } from 'react'

import { Resizer, Direction } from './resizer'
import { useHandle } from './hooks/useHandle'

import { getStringSize, isTouchEvent, isMouseEvent, definedProps } from './util'
export * from './types'
import type { ResizableProps, State } from './types'

// 默认尺寸
const DEFAULT_SIZE = {
  width: 'auto',
  height: 'auto'
}

// 声明全局接口
declare global {
  interface Window {
    MouseEvent: typeof MouseEvent
    TouchEvent: typeof TouchEvent
  }
}

// Resizable组件类
export const Resizable: React.FC<ResizableProps> = (props) => {
  const {
    enable = {
      top: true,
      right: true,
      bottom: true,
      left: true,
      topRight: true,
      bottomRight: true,
      bottomLeft: true,
      topLeft: true
    },
    handleStyles,
    handleClasses,
    handleWrapperStyle,
    handleWrapperClass,
    handleComponent,
    lockAspectRatio = false
  } = props

  // 获取组件的尺寸属性
  const propsSize = props.size || props.defaultSize || DEFAULT_SIZE

  const [state, setState] = useState<State>({
    isResizing: false,
    width: propsSize?.width ?? 'auto',
    height: propsSize?.height ?? 'auto',
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
  })

  const resizableRef = useRef<HTMLElement | null>(null)

  const parentNode = resizableRef.current?.parentNode as HTMLElement | null
  const { setBoundingClientRect, getParentSize, cpuSize, ratio, flexDir } = useHandle(
    props,
    state,
    setState,
    resizableRef,
    parentNode
  )

  // 获取尺寸样式
  const sizeStyle = useCallback((): { width: string; height: string } => {
    const getSize = (key: 'width' | 'height'): string => {
      if (typeof state[key] === 'undefined' || state[key] === 'auto') {
        return 'auto'
      }
      if (propsSize && propsSize[key] && propsSize[key]?.toString().endsWith('%')) {
        if (state[key].toString().endsWith('%')) {
          return state[key].toString()
        }
        const parentSize = getParentSize()

        const value = Number(state[key].toString().replace('px', ''))
        const percent = (value / parentSize[key]) * 100
        return `${percent}%`
      }
      return getStringSize(state[key])
    }
    const width =
      props.size && typeof props.size.width !== 'undefined' && !state.isResizing
        ? getStringSize(props.size.width)
        : getSize('width')
    const height =
      props.size && typeof props.size.height !== 'undefined' && !state.isResizing
        ? getStringSize(props.size.height)
        : getSize('height')
    return { width, height }
  }, [state,  props.size])

  // 开始调整大小
  const onResizeStart = useCallback(
    (
      event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
      direction: Direction
    ) => {
      if (!resizableRef.current || !window) {
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
      if (props.onResizeStart) {
        if (resizableRef.current) {
          const startResize = props.onResizeStart(event, direction, resizableRef.current)
          if (startResize === false) {
            return
          }
        }
      }

      // 修复 #168
      if (props.size) {
        if (typeof props.size.height !== 'undefined' && props.size.height !== state.height) {
          setState((prevState) => ({ ...prevState, height: props.size?.height ?? 'auto' }))
        }
        if (typeof props.size.width !== 'undefined' && props.size.width !== state.width) {
          setState((prevState) => ({ ...prevState, width: props.size?.width ?? 'auto' }))
        }
      }

      // 对于锁定长宽比的情况
      ratio.current =
        typeof lockAspectRatio === 'number' ? lockAspectRatio : cpuSize().width / cpuSize().height

      let flexBasis
      const computedStyle = window.getComputedStyle(resizableRef.current)
      if (computedStyle.flexBasis !== 'auto') {
        const parent = parentNode
        if (parent) {
          const dir = window.getComputedStyle(parent).flexDirection
          flexDir.current = dir.startsWith('row') ? 'row' : 'column'
          flexBasis = computedStyle.flexBasis
        }
      }
      // 对于边界
      setBoundingClientRect()
      const newState = {
        original: {
          x: clientX,
          y: clientY,
          width: cpuSize().width,
          height: cpuSize().height
        },
        isResizing: true,
        backgroundStyle: {
          ...state.backgroundStyle,
          cursor: window.getComputedStyle(event.target as HTMLElement).cursor || 'auto'
        },
        direction,
        flexBasis
      }
      setState((prevState) => ({ ...prevState, ...newState }))
    },
    [resizableRef, props, state, cpuSize, parentNode]
  )

  // 渲染调整器
  const renderResizer = useCallback(() => {
    if (!enable) {
      return null
    }
    const resizers = Object.keys(enable).map((dir) => {
      if (enable[dir as Direction] !== false) {
        return (
          <Resizer
            key={dir}
            direction={dir as Direction}
            onResizeStart={onResizeStart}
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
  }, [props, onResizeStart])

  const extendsProps = Object.keys(props).reduce(
    (acc, key) => {
      if (definedProps.indexOf(key) !== -1) {
        return acc
      }
      acc[key] = props[key as keyof ResizableProps]
      return acc
    },
    {} as { [key: string]: any }
  )

  const style: React.CSSProperties = {
    position: 'relative',
    userSelect: state.isResizing ? 'none' : 'auto',
    ...(props.style || {}),
    ...sizeStyle(),
    maxWidth: props.maxWidth,
    maxHeight: props.maxHeight,
    minWidth: props.minWidth,
    minHeight: props.minHeight,
    boxSizing: 'border-box',
    flexShrink: 0
  }

  if (state.flexBasis) {
    style.flexBasis = state.flexBasis
  }

  const Wrapper = props.as || 'div'

  return (
    <Wrapper style={style} className={props.className} {...extendsProps} ref={resizableRef}>
      {state.isResizing && <div style={state.backgroundStyle} />}
      {props.children}
      {renderResizer()}
    </Wrapper>
  )
}
