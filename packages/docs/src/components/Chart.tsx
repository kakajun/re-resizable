import React, { useRef, useEffect, useImperativeHandle } from 'react'
import * as echarts from 'echarts'

import { useTranslation } from 'react-i18next'
interface ChartMethods {
  resize: () => void
}
const ChartComponent = React.forwardRef<ChartMethods, {}>((_, ref) => {
  const chartRef = useRef<HTMLDivElement | null>(null)
  let chart: echarts.ECharts | null = null

  useEffect(() => {
    init()
  }, [])

  const init = () => {
    if (chartRef.current) {
      chart = echarts.init(chartRef.current)
      chart.setOption({
        title: {
          text: 'chartTitle'
        },
        tooltip: {},
        xAxis: {
          data: ['item1', 'item2', 'item3', 'item4', 'item5', 'item6']
        },
        yAxis: {},
        series: [
          {
            name: 'Sales',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      })
    }
  }
  const resize = () => {
    chart?.resize()
  }
  // 使用 useImperativeHandle 来暴露这些方法
  useImperativeHandle(ref, () => ({
    resize
  }))

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
})

export default ChartComponent
