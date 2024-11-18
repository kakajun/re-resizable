import { Resizable } from 'react-resize'
import React from 'react'
const BasicComponent = () => {
  return (
    <>
      <span>vw</span>
      <Resizable className="rectstyle" defaultSize={{ width: '20vw', height: '20vw' }}>
        001
      </Resizable>
      <span>vh</span>
      <Resizable className="rectstyle" defaultSize={{ width: '20vh', height: '20vh' }}>
        001
      </Resizable>
    </>
  )
}

export default BasicComponent
