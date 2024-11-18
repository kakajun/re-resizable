import { Resizable } from 'react-resize'
import React from 'react'
const BasicComponent = () => {
  return (
    <Resizable
      className="rectstyle"
      defaultSize={{
        width: 200,
        height: 300
      }}
      lockAspectRatio
    >
      001
    </Resizable>
  )
}

export default BasicComponent
