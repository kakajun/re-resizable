import { Resizable } from 'react-resize'
import React from 'react'
import { Input } from 'antd'

const BasicComponent = () => {
  const [state, setState] = React.useState({
    width: '30%',
    height: '20%'
  })

  React.useEffect(() => {
    console.log(state, 'size')
  }, [state])

  const onChange = (e: any) => {
    setState({
      ...state,
      width: e.target.value
    })
  }

  const onChangeHeight = (e: any) => {
    setState({
      ...state,
      height: e.target.value
    })
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '20px' }}>
        <span>宽度:</span>
        <Input
          style={{ width: 80 }}
          placeholder="Basic usage"
          value={state.width}
          onChange={onChange}
        />
        <span>高度:</span>
        <Input
          style={{ width: 80 }}
          placeholder="Basic usage"
          value={state.height}
          onChange={onChangeHeight}
        />
      </div>

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
    </>
  )
}

export default BasicComponent
