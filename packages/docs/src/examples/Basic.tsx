import { Resizable } from 'react-resize'

const BasicComponent = () => {
  return (
    <Resizable
      className="rectstyle"
      defaultSize={{
        width: 200,
        height: 200
      }}
    >
      001
    </Resizable>
  )
}

export default BasicComponent
