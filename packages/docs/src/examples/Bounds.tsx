import { Resizable } from 'react-resize'
import React from 'react'
const BasicComponent = () => {
  return (
    <>
      <span>'bounds="parent"'</span>
      <Resizable
        className="rectstyle"
        defaultSize={{
          width: 200,
          height: 200
        }}
        bounds="parent"
      >
        001
      </Resizable>
      <span>'bounds="window"'</span>
      <Resizable
        className="rectstyle"
        defaultSize={{
          width: 200,
          height: 200
        }}
        bounds="window"
      >
        001
      </Resizable>
    </>
  )
}

export default BasicComponent
