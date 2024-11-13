import { test, expect } from '@playwright/experimental-ct-react'
import { spy } from 'sinon'
import { Resizable } from '.'

test.use({ viewport: { width: 500, height: 500 } })

test('should box width and height equal 100px', async ({ mount }) => {
  const resizable = await mount(<Resizable defaultSize={{ width: 100, height: 100 }} />)
  const divs = resizable.locator('div')
  const width = await resizable.evaluate((node) => node.style.width)
  const height = await resizable.evaluate((node) => node.style.height)
  const position = await resizable.evaluate((node) => node.style.position)

  expect(await divs.count()).toBe(9)
  expect(width).toBe('100px')
  expect(height).toBe('100px')
  expect(position).toBe('relative')
})

test('should allow vh, vw relative units', async ({ mount }) => {
  const resizable = await mount(<Resizable defaultSize={{ width: '100vw', height: '100vh' }} />)

  const divs = resizable.locator('div')
  const width = await resizable.evaluate((node) => node.style.width)
  const height = await resizable.evaluate((node) => node.style.height)
  const position = await resizable.evaluate((node) => node.style.position)

  expect(await divs.count()).toBe(9)
  expect(width).toBe('100vw')
  expect(height).toBe('100vh')
  expect(position).toBe('relative')
})

test('should allow vmax, vmin relative units', async ({ mount }) => {
  const resizable = await mount(<Resizable defaultSize={{ width: '100vmax', height: '100vmin' }} />)

  const divs = resizable.locator('div')
  const width = await resizable.evaluate((node) => node.style.width)
  const height = await resizable.evaluate((node) => node.style.height)
  const position = await resizable.evaluate((node) => node.style.position)

  expect(await divs.count()).toBe(9)
  expect(width).toBe('100vmax')
  expect(height).toBe('100vmin')
  expect(position).toBe('relative')
})

test('should box width and height equal auto when size omitted', async ({ mount }) => {
  const resizable = await mount(<Resizable />)
  const divs = resizable.locator('div')
  expect(await divs.count()).toBe(9)
  expect(await resizable.evaluate((node) => node.style.width)).toBe('auto')
  expect(await resizable.evaluate((node) => node.style.height)).toBe('auto')
  expect(await resizable.evaluate((node) => node.style.position)).toBe('relative')
})

test('should box width and height equal auto when set auto', async ({ mount }) => {
  const resizable = await mount(<Resizable defaultSize={{ width: 'auto', height: 'auto' }} />)
  const divs = resizable.locator('div')
  expect(await divs.count()).toBe(9)
  expect(await resizable.evaluate((node) => node.style.width)).toBe('auto')
  expect(await resizable.evaluate((node) => node.style.height)).toBe('auto')
  expect(await resizable.evaluate((node) => node.style.position)).toBe('relative')
})

test('Should style is applied to box', async ({ mount }) => {
  const resizable = await mount(<Resizable style={{ position: 'absolute' }} />)
  const divs = resizable.locator('div')
  expect(await divs.count()).toBe(9)
  expect(await resizable.evaluate((node) => node.style.position)).toBe('absolute')
})

test('Should custom class name be applied to box', async ({ mount }) => {
  const resizable = await mount(<Resizable className={'custom-class-name'} />)

  const divs = resizable.locator('div')
  expect(await divs.count()).toBe(9)
  expect(await resizable.evaluate((node) => node.className)).toBe('custom-class-name')
})

test('Should use a custom wrapper element', async ({ mount }) => {
  const resizable = await mount(<Resizable as="header" />)

  expect(await resizable.evaluate((node) => node.tagName)).toBe('HEADER')
})

test('Should custom class name be applied to resizer', async ({ mount }) => {
  const resizable = await mount(<Resizable handleClasses={{ right: 'right-handle-class' }} />)
  expect(await resizable.evaluate((node) => node.querySelector('.right-handle-class'))).toBeTruthy()
})

test('Should create custom span that wraps resizable divs ', async ({ mount }) => {
  const resizable = await mount(<Resizable handleWrapperClass="wrapper-class" />)

  const divs = resizable.locator('div')

  expect(await (await divs.all())[0].evaluate((node) => node.className)).toBe('wrapper-class')
})

test('Should not render resizer when enable props all false', async ({ mount }) => {
  const resizable = await mount(
    <Resizable
      enable={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
      }}
    />
  )

  const divs = resizable.locator('div')
  expect(await divs.count()).toBe(1)
})

test('Should disable all resizer', async ({ mount }) => {
  const resizable = await mount(<Resizable enable={false} />)

  const divs = resizable.locator('div')
  expect(await divs.count()).toBe(0)
})

test('Should render one resizer when one enable props set true', async ({ mount }) => {
  const resizable = await mount(
    <Resizable
      enable={{
        top: false,
        right: true,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
      }}
    />
  )
  const divs = resizable.locator('div')
  expect(await divs.count()).toBe(2)
})

test('Should render two resizer when two enable props set true', async ({ mount }) => {
  const resizable = await mount(
    <Resizable
      enable={{
        top: true,
        right: true,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
      }}
    />
  )
  const divs = resizable.locator('div')
  expect(await divs.count()).toBe(3)
})

test('Should render three resizer when three enable props set true', async ({ mount }) => {
  const resizable = await mount(
    <Resizable
      enable={{
        top: true,
        right: true,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
      }}
    />
  )
  const divs = resizable.locator('div')
  expect(await divs.count()).toBe(4)
})

test('Should only right is resizable and call onResizeStart when mousedown', async ({ mount }) => {
  const onResizeStart = spy()
  const resizable = await mount(
    <Resizable
      onResizeStart={onResizeStart}
      enable={{
        top: false,
        right: true,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
      }}
    />
  )
  const divs = resizable.locator('div')
  expect(await divs.count()).toBe(2)
  await (await divs.all())[1].dispatchEvent('mousedown')
  expect(onResizeStart.callCount).toBe(1)
  expect(onResizeStart.getCall(0).args[1]).toBe('right')
})

test('Should only bottom is resizable and call onResizeStart when mousedown', async ({ mount }) => {
  const onResizeStart = spy()
  const resizable = await mount(
    <Resizable
      onResizeStart={onResizeStart}
      enable={{
        top: false,
        right: false,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
      }}
    />
  )
  const divs = resizable.locator('div')
  expect(await divs.count()).toBe(2)
  await (await divs.all())[1].dispatchEvent('mousedown')
  expect(onResizeStart.callCount).toBe(1)
  expect(onResizeStart.getCall(0).args[1]).toBe('bottom')
})

test('Should only bottomRight is resizable and call onResizeStart when mousedown', async ({
  mount
}) => {
  const onResizeStart = spy()
  const resizable = await mount(
    <Resizable
      onResizeStart={onResizeStart}
      enable={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false
      }}
    />
  )
  const divs = resizable.locator('div')
  expect(await divs.count()).toBe(2)
  await (await divs.all())[1].dispatchEvent('mousedown')
  expect(onResizeStart.callCount).toBe(1)
  expect(onResizeStart.getCall(0).args[1]).toBe('bottomRight')
})

test('Should not begin resize when onResizeStart returns false', async ({ mount, page }) => {
  const onResizeStart = () => {
    return false
  }
  const onResize = spy()
  const resizable = await mount(<Resizable onResizeStart={onResizeStart} onResize={onResize} />)
  const divs = resizable.locator('div')
  await (await divs.all())[1].dispatchEvent('mousedown')
  // 添加等待时间，确保事件处理完成
  await page.waitForTimeout(100) // 等待100毫秒
  await page.mouse.move(100, 200)
  expect(onResize.callCount).toBe(0)
})
