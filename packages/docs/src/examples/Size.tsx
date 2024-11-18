import { Resizable } from 'react-resize'
import React from 'react'
const BasicComponent = () => {
  const [state, setState] = React.useState({
    width: '30%',
    height: '20%'
  })

  return (
    <Resizable
      className="rectstyle"
      size={state}
      onResizeStop={(e, direction, ref, d) => {
        setState({
          width: ref.style.width,
          height: ref.style.height
        })
      }}
    >
      001
    </Resizable>
  )
}

export default BasicComponent
