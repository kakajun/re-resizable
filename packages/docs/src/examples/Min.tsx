import { Resizable } from 'react-resize'
import React from 'react'
const BasicComponent = () => {
  return (
    <>
      <span>minHeight</span>
      <Resizable
        className="rectstyle"
        defaultSize={{
          width: 200,
          height: 200
        }}
        minHeight="200px"
      >
        001
      </Resizable>
      <span>minWidth</span>
      <Resizable
        className="rectstyle"
        defaultSize={{
          width: 200,
          height: 200
        }}
        minWidth="200px"
      >
        001
      </Resizable>
      <span>percentage</span>
      <Resizable
        className="rectstyle"
        defaultSize={{
          width: 200,
          height: 200
        }}
        minWidth="30%"
        minHeight="50%"
      >
        001
      </Resizable>
    </>
  )
}

export default BasicComponent
