import { useState } from 'react'
import Drager, { type DragData } from 'react-es-drager'
import { useTranslation } from 'react-i18next'
import './Basic.less'
import './Basic.less'

const BasicComponent = () => {
  const { t } = useTranslation()
  const [dragList, setDragList] = useState<DragData>( [
    [
      {
        text: 'examples.move',
        resizable: false,
        rotatable: false,
        width: 100,
        height: 100,
        left: 30,
        top: 30
      },
      {
        color: '#00c48f',
        text: 'examples.moveAndResize',
        rotatable: false,
        width: 100,
        height: 100,
        left: 180,
        top: 180
      },
      {
        color: '#ff9f00',
        text: 'examples.rotate',
        // angle: 30,
        rotatable: true,
        resizable: false,
        width: 100,
        height: 100,
        left: 330,
        top: 330
      },
      {
        color: '#f44336',
        text: 'examples.rotateAndResize',
        rotatable: true,
        width: 100,
        height: 100,
        left: 480,
        top: 480
      }
    ],
    [
      {
        color: '#6A00FF',
        text: 'examples.boundary',
        boundary: true,
        width: 100,
        height: 100,
        left: 30,
        top: 30
      },
      {
        color: '#A20025',
        text: 'examples.disabled',
        disabled: true,
        width: 100,
        height: 100,
        left: 180,
        top: 180
      },
      {
        color: '#D80073',
        text: 'examples.checkCollision',
        checkCollision: true,
        width: 100,
        height: 100,
        left: 330,
        top: 330
      },
      {
        color: '#1BA1E2',
        text: 'examples.minSzie',
        minWidth: 10,
        minHeight: 10,
        width: 100,
        height: 100,
        left: 480,
        top: 480
      }
    ],
    [
      {
        color: '#31eff6',
        text: 'examples.snap',
        boundary: true,
        snap: true,
        width: 100,
        height: 100,
        left: 30,
        top: 30
      },
      {
        color: '#f46619',
        text: 'examples.markline',
        boundary: true,
        markline: true,
        width: 100,
        height: 100,
        left: 180,
        top: 180
      },
      {
        color: '#6bf419',
        text: 'examples.snapAndMarkline',
        boundary: true,
        snap: true,
        markline: true,
        width: 100,
        height: 100,
        left: 330,
        top: 330
      }
    ]
  ])
  return (
    <>
      {dragList.map((list, index) =>
        list.map((item, index2) => (
          <Drager key={`${index}-${index2}`} {...item} style={{ color: item.color }} @change=>
            {t(item.text)}
          </Drager>
        ))
      )}
    </>
  )
}

export default BasicComponent
