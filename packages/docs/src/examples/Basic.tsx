import { Resizable } from 'react-resize'
import './style.css'

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
