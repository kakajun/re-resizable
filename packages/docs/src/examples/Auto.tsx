import { Resizable } from 'react-resize'
import './style.css'

const BasicComponent = () => {
  return (
    <div>
      <div style={{ padding: '10px' }}>default</div>
      <Resizable className="rectstyle" onResize={(e) => console.log(e)}>
        001
      </Resizable>
      <div style={{ padding: '10px' }}>height</div>
      <Resizable
        className="rectstyle"
        defaultSize={{
          width: 200,
          height: 'auto'
        }}
      >
        001
      </Resizable>
      <div style={{ padding: '10px' }}>width</div>
      <Resizable
        className="rectstyle"
        defaultSize={{
          width: 'auto',
          height: 200
        }}
      >
        001
      </Resizable>
    </div>
  )
}

export default BasicComponent
