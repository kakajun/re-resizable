import { Resizable } from 'react-resize'
import React from 'react'
const BasicComponent = () => {
  return (
    <>
      <span>maxHeight</span>
      <Resizable
        className="rectstyle"
        defaultSize={{
          width: 200,
          height: 200
        }}
        maxHeight="400px"
      >
        001
      </Resizable>
      <span>maxWidth</span>
      <Resizable
        className="rectstyle"
        defaultSize={{
          width: 200,
          height: 200
        }}
        maxWidth="400px"
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
        maxWidth="30%"
        maxHeight="50%"
      >
        001
      </Resizable>
    </>
  )
}

export default BasicComponent
