import { useCallback, useRef } from 'react'
import type { NumberSize, ResizableProps, State, NewSize } from '../types'
import { flushSync } from 'react-dom'
import {
  clamp,
  snap,
  hasDirection,
  isTouchEvent,
  calculateNewMax,
  findClosestSnap,
  normalizeToPair
} from '../util'

export const useHandle = (
  props: ResizableProps,
  state: State,
  setState: (state: State) => void,
  resizableRef: React.RefObject<HTMLElement>,
  parentNode: HTMLElement
) => {
  const parentLeft = useRef<number>(0)
  const parentTop = useRef<number>(0)
  const resizableLeft = useRef<number>(0)
  const resizableRight = useRef<number>(0)
  const resizableTop = useRef<number>(0)
  const resizableBottom = useRef<number>(0)
  const targetLeft = useRef<number>(0)
  const targetTop = useRef<number>(0)
  const ratio = useRef<number>(1)
  const flexDir = useRef<'row' | 'column' | undefined>(undefined)
  // 基础类名，用于计算百分比尺寸
  const baseClassName = '__resizable_base__'

  const {
    grid = [1, 1],
    gridGap = [0, 0],
    lockAspectRatioExtraWidth = 0,
    lockAspectRatioExtraHeight = 0,
    scale = 1,
    resizeRatio = 1,
    snapGap = 0
  } = props
  // 获取当前尺寸
  const cpuSize = useCallback((): NumberSize => {
    let width = 0
    let height = 0
    if (resizableRef.current && window) {
      const orgWidth = resizableRef.current.offsetWidth
      const orgHeight = resizableRef.current.offsetHeight
      const orgPosition = resizableRef.current.style.position
      if (orgPosition !== 'relative') {
        resizableRef.current.style.position = 'relative'
      }
      width =
        resizableRef.current.style.width !== 'auto' ? resizableRef.current.offsetWidth : orgWidth
      height =
        resizableRef.current.style.height !== 'auto' ? resizableRef.current.offsetHeight : orgHeight
      resizableRef.current.style.position = orgPosition
    }
    return { width, height }
  }, [resizableRef])

  // 为CSS属性创建尺寸
  const createSizeForCssProperty = (
    newSize: number | string,
    kind: 'width' | 'height'
  ): number | string => {
    const propsSize = props.size && props.size[kind]
    return state[kind] === 'auto' &&
      state.original[kind] === newSize &&
      (typeof propsSize === 'undefined' || propsSize === 'auto')
      ? 'auto'
      : newSize
  }

  // 从边界计算新的最大尺寸
  const calculateNewMaxFromBoundary = (maxWidth?: number, maxHeight?: number) => {
    const { boundsByDirection } = props
    const { direction } = state
    const widthByDirection = boundsByDirection && hasDirection('left', direction)
    const heightByDirection = boundsByDirection && hasDirection('top', direction)
    let boundWidth
    let boundHeight
    if (props.bounds === 'parent') {
      const parent = parentNode
      if (parent) {
        boundWidth = widthByDirection
          ? resizableRight.current - parentLeft.current
          : parent.offsetWidth + (parentLeft.current - resizableLeft.current)
        boundHeight = heightByDirection
          ? resizableBottom.current - parentTop.current
          : parent.offsetHeight + (parentTop.current - resizableTop.current)
      }
    } else if (props.bounds === 'window') {
      if (window) {
        boundWidth = widthByDirection
          ? resizableRight.current
          : window.innerWidth - resizableLeft.current
        boundHeight = heightByDirection
          ? resizableBottom.current
          : window.innerHeight - resizableTop.current
      }
    } else if (props.bounds) {
      boundWidth = widthByDirection
        ? resizableRight.current - targetLeft.current
        : props.bounds.offsetWidth + (targetLeft.current - resizableLeft.current)
      boundHeight = heightByDirection
        ? resizableBottom.current - targetTop.current
        : props.bounds.offsetHeight + (targetTop.current - resizableTop.current)
    }
    if (boundWidth && Number.isFinite(boundWidth)) {
      maxWidth = maxWidth && maxWidth < boundWidth ? maxWidth : boundWidth
    }
    if (boundHeight && Number.isFinite(boundHeight)) {
      maxHeight = maxHeight && maxHeight < boundHeight ? maxHeight : boundHeight
    }
    return { maxWidth, maxHeight }
  }
  // 获取父节点尺寸
  const getParentSize = useCallback((): { width: number; height: number } => {
    if (!parentNode) {
      if (!window) {
        return { width: 0, height: 0 }
      }
      return { width: window.innerWidth, height: window.innerHeight }
    }
    const base = appendBase()
    if (!base) {
      return { width: 0, height: 0 }
    }
    let wrapChanged = false
    const wrap = parentNode.style.flexWrap
    if (wrap !== 'wrap') {
      wrapChanged = true
      parentNode.style.flexWrap = 'wrap'
    }
    base.style.position = 'relative'
    base.style.minWidth = '100%'
    base.style.minHeight = '100%'
    const size = {
      width: base.offsetWidth,
      height: base.offsetHeight
    }
    if (wrapChanged) {
      parentNode.style.flexWrap = wrap
    }
    removeBase(base)
    return size
  }, [parentNode, window])
  // 根据方向计算新的尺寸
  const calculateNewSizeFromDirection = (clientX: number, clientY: number) => {
    const [resizeRatioX, resizeRatioY] = normalizeToPair(resizeRatio || 1)
    const { direction, original } = state
    const { lockAspectRatio } = props
    let newWidth = original.width
    let newHeight = original.height
    const extraHeight = lockAspectRatioExtraHeight
    const extraWidth = lockAspectRatioExtraWidth || 0
    if (hasDirection('right', direction)) {
      newWidth = original.width + ((clientX - original.x) * resizeRatioX) / scale
      if (lockAspectRatio) {
        newHeight = (newWidth - extraWidth) / ratio.current + extraHeight
      }
    }
    if (hasDirection('left', direction)) {
      newWidth = original.width - ((clientX - original.x) * resizeRatioX) / scale
      if (lockAspectRatio) {
        newHeight = (newWidth - extraWidth) / ratio.current + extraHeight
      }
    }
    if (hasDirection('bottom', direction)) {
      newHeight = original.height + ((clientY - original.y) * resizeRatioY) / scale
      if (lockAspectRatio) {
        newWidth = (newHeight - extraHeight) * ratio.current + extraWidth
      }
    }
    if (hasDirection('top', direction)) {
      newHeight = original.height - ((clientY - original.y) * resizeRatioY) / scale
      if (lockAspectRatio) {
        newWidth = (newHeight - extraHeight) * ratio.current + extraWidth
      }
    }
    return { newWidth, newHeight }
  }

  // 根据长宽比计算新的尺寸
  const calculateNewSizeFromAspectRatio = (
    newWidth: number,
    newHeight: number,
    max: { width?: number; height?: number },
    min: { width?: number; height?: number }
  ) => {
    const computedMinWidth = typeof min.width === 'undefined' ? 10 : min.width
    const computedMaxWidth =
      typeof max.width === 'undefined' || max.width < 0 ? newWidth : max.width
    const computedMinHeight = typeof min.height === 'undefined' ? 10 : min.height
    const computedMaxHeight =
      typeof max.height === 'undefined' || max.height < 0 ? newHeight : max.height
    const extraHeight = props.lockAspectRatioExtraHeight
    const extraWidth = props.lockAspectRatioExtraWidth
    if (props.lockAspectRatio) {
      const extraMinWidth = (computedMinHeight - extraHeight) * ratio.current + extraWidth
      const extraMaxWidth = (computedMaxHeight - extraHeight) * ratio.current + extraWidth
      const extraMinHeight = (computedMinWidth - extraWidth) / ratio.current + extraHeight
      const extraMaxHeight = (computedMaxWidth - extraWidth) / ratio.current + extraHeight
      newWidth = clamp(newWidth, extraMinWidth, extraMaxWidth)
      newHeight = clamp(newHeight, extraMinHeight, extraMaxHeight)
    } else {
      newWidth = clamp(newWidth, computedMinWidth, computedMaxWidth)
      newHeight = clamp(newHeight, computedMinHeight, computedMaxHeight)
    }
    return { newWidth, newHeight }
  }

  // 鼠标移动事件
  const onMouseMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!state.isResizing || !resizableRef.current || !window) {
        return
      }

      if (window.TouchEvent && isTouchEvent(event)) {
        try {
          event.preventDefault()
          event.stopPropagation()
        } catch (e) {
          // 忽略失败
        }
      }

      let { maxWidth, maxHeight, minWidth, minHeight } = props
      const clientX = isTouchEvent(event) ? event.touches[0].clientX : event.clientX
      const clientY = isTouchEvent(event) ? event.touches[0].clientY : event.clientY
      const { direction, original, width, height } = state
      const parentSize = getParentSize()
      const max = calculateNewMax(
        parentSize,
        window.innerWidth,
        window.innerHeight,
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
      let { newHeight, newWidth }: NewSize = calculateNewSizeFromDirection(clientX, clientY)

      // 从边界设置计算最大尺寸
      const boundaryMax = calculateNewMaxFromBoundary(maxWidth, maxHeight)

      if (props.snap && props.snap.x) {
        newWidth = findClosestSnap(newWidth, props.snap.x, props.snapGap)
      }
      if (props.snap && props.snap.y) {
        newHeight = findClosestSnap(newHeight, props.snap.y, snapGap)
      }

      // 从长宽比计算新尺寸
      const newSize = calculateNewSizeFromAspectRatio(
        newWidth,
        newHeight,
        { width: boundaryMax.maxWidth, height: boundaryMax.maxHeight },
        { width: minWidth, height: minHeight }
      )
      newWidth = newSize.newWidth
      newHeight = newSize.newHeight

      if (grid) {
        const newGridWidth = snap(newWidth, grid[0], gridGap ? gridGap[0] : 0)
        const newGridHeight = snap(newHeight, grid[1], gridGap ? gridGap[1] : 0)
        const gap = snapGap || 0
        const w = gap === 0 || Math.abs(newGridWidth - newWidth) <= gap ? newGridWidth : newWidth
        const h =
          gap === 0 || Math.abs(newGridHeight - newHeight) <= gap ? newGridHeight : newHeight
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
          const vw = (newWidth / window.innerWidth) * 100
          newWidth = `${vw}vw`
        } else if (width.endsWith('vh')) {
          const vh = (newWidth / window.innerHeight) * 100
          newWidth = `${vh}vh`
        }
      }

      if (height && typeof height === 'string') {
        if (height.endsWith('%')) {
          const percent = (newHeight / parentSize.height) * 100
          newHeight = `${percent}%`
        } else if (height.endsWith('vw')) {
          const vw = (newHeight / window.innerWidth) * 100
          newHeight = `${vw}vw`
        } else if (height.endsWith('vh')) {
          const vh = (newHeight / window.innerHeight) * 100
          newHeight = `${vh}vh`
        }
      }

      const newState: {
        width: string | number
        height: string | number
        flexBasis?: string | number
      } = {
        width: createSizeForCssProperty(newWidth, 'width'),
        height: createSizeForCssProperty(newHeight, 'height')
      }

      if (flexDir.current === 'row') {
        newState.flexBasis = newState.width
      } else if (flexDir.current === 'column') {
        newState.flexBasis = newState.height
      }

      const widthChanged = state.width !== newState.width
      const heightChanged = state.height !== newState.height
      const flexBaseChanged = state.flexBasis !== newState.flexBasis
      const changed = widthChanged || heightChanged || flexBaseChanged

      if (changed) {
        // 对于v18，更新状态同步
        flushSync(() => {
          setState((prevState) => ({ ...prevState, ...newState }))
        })
      }

      if (props.onResize) {
        if (changed) {
          //   props.onResize(event, direction, resizableRef.current, delta)
        }
      }
    },
    [
      state,
      resizableRef,
      props,
      getParentSize,
      calculateNewSizeFromDirection,
      calculateNewMaxFromBoundary,
      calculateNewSizeFromAspectRatio
    ]
  )

  // 鼠标抬起事件
  const onMouseUp = (event: MouseEvent | TouchEvent) => {
    const { isResizing, direction, original } = state

    if (!isResizing || !resizableRef.current) {
      return
    }
    const delta = {
      width: cpuSize().width - original.width,
      height: cpuSize().height - original.height
    }
    if (props.onResizeStop) {
      props.onResizeStop(event, direction, resizableRef.current, delta)
    }
    if (props.size) {
      setState((prevState: State) => ({
        ...prevState,
        width: props.size?.width ?? 'auto',
        height: props.size?.height ?? 'auto'
      }))
    }
    setState((prevState: State) => ({
      ...prevState,
      isResizing: false,
      backgroundStyle: { ...prevState.backgroundStyle, cursor: 'auto' }
    }))
  }

  // 事件处理
  const bindEvents = useCallback(() => {
    if (window) {
      window.addEventListener('mouseup', onMouseUp)
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseleave', onMouseUp)
      window.addEventListener('touchmove', onMouseMove, {
        capture: true,
        passive: false
      })
      window.addEventListener('touchend', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  const unbindEvents = useCallback(() => {
    if (window) {
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseUp)
      window.removeEventListener('touchmove', onMouseMove, true)
      window.removeEventListener('touchend', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  // 设置边界的客户端矩形
  const setBoundingClientRect = () => {
    const adjustedScale = 1 / (scale || 1)

    // 对于父边界
    if (props.bounds === 'parent') {
      const parent = parentNode
      if (parent) {
        const parentRect = parent.getBoundingClientRect()
        parentLeft.current = parentRect.left * adjustedScale
        parentTop.current = parentRect.top * adjustedScale
      }
    }

    // 对于目标（html元素）边界
    if (props.bounds && typeof props.bounds !== 'string') {
      const targetRect = props.bounds.getBoundingClientRect()
      targetLeft.current = targetRect.left * adjustedScale
      targetTop.current = targetRect.top * adjustedScale
    }

    // 对于边界
    if (resizableRef.current) {
      const { left, top, right, bottom } = resizableRef.current.getBoundingClientRect()
      resizableLeft.current = left * adjustedScale
      resizableRight.current = right * adjustedScale
      resizableTop.current = top * adjustedScale
      resizableBottom.current = bottom * adjustedScale
    }
  }

  // 添加基础元素
  const appendBase = useCallback(() => {
    if (!resizableRef.current || !window) {
      return null
    }
    const parent = parentNode
    if (!parent) {
      return null
    }
    const element = window.document.createElement('div')
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
  }, [resizableRef, window, parentNode])

  // 移除基础元素
  const removeBase = useCallback(
    (base: HTMLElement) => {
      const parent = parentNode
      if (!parent) {
        return
      }
      parent.removeChild(base)
    },
    [parentNode]
  )

  return {
    bindEvents,
    unbindEvents,
    cpuSize,
    setBoundingClientRect,
    getParentSize,
    ratio,
    flexDir
  }
}
