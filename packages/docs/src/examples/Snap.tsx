import { Resizable } from 'react-resize'
import React from 'react'
const BasicComponent = () => {
  return (
    <>
      <Resizable
        className="rectstyle"
        style={{ padding: '20px' }}
        snap={{ x: [100, 300, 450], y: [100, 300, 450] }}
        snapGap={100}
        defaultSize={{ width: 50, height: 50 }}
        onResize={(a) => {
          console.log(a)
        }}
      >
        001
      </Resizable>

      <Resizable
        className="rectstyle"
        grid={[100, 100]}
        snapGap={20}
        defaultSize={{ width: 50, height: 50 }}
        onResize={(a) => {
          console.log(a)
        }}
      >
        001
      </Resizable>
    </>
  )
}

export default BasicComponent
