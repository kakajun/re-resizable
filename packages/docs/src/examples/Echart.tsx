import { Resizable } from 'react-resize'
import React, { useRef } from 'react'
import Chart from '@/components/Chart'

// 确保 ChartType 与 ChartMethods 一致
type ChartType = {
  resize: () => void
}

const BasicComponent = () => {
  const chartRef = useRef<ChartType>(null) // 确保类型与 ChartMethods 一致
  const handleResize = () => {
    if (chartRef.current) {
      chartRef.current.resize()
    }
  }

  return (
    <Resizable
      className="rectstyle"
      defaultSize={{
        width: 200,
        height: 200
      }}
      onResize={handleResize} // 添加 onResize 事件处理
    >
      <Chart ref={chartRef} />
    </Resizable>
  )
}

export default BasicComponent
