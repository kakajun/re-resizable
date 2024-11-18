import { Resizable } from 'react-resize'
import React from 'react'
import './Extra.less'
const aspectRatio = 16 / 9

const BasicComponent = () => {
  return (
    <>
      <div style={{ padding: '20px' }}>
        <Resizable
          className="style"
          defaultSize={{
            width: 400,
            height: 400 / aspectRatio + 50
          }}
          lockAspectRatio={aspectRatio}
          lockAspectRatioExtraHeight={50}
        >
          <div className="header">Header</div>
          <div className="content">Content</div>
        </Resizable>
      </div>
      <div style={{ padding: '20px' }}>
        <Resizable
          className="style"
          defaultSize={{
            width: 400 + 50,
            height: 400 / aspectRatio + 50
          }}
          lockAspectRatio={aspectRatio}
          lockAspectRatioExtraHeight={50}
          lockAspectRatioExtraWidth={50}
        >
          <div className="header">Header</div>
          <div className="wrapper">
            <div className="sidebar">Nav</div>
            <div className="content">001</div>
          </div>
        </Resizable>
      </div>
    </>
  )
}

export default BasicComponent
