import React, { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'

export default function Chart({ symbol = 'AAPL' }) {
  const ref = useRef()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8000/api/market-data/ohlcv/${symbol}?period=1mo&interval=1d`)
        if (!response.ok) {
          throw new Error('Failed to fetch chart data')
        }
        const data = await response.json()

        const chart = createChart(ref.current, { width: 800, height: 400 })
        const candle = chart.addCandlestickSeries()

        // Transform data to match lightweight-charts format
        const chartData = data.map(item => ({
          time: new Date(item.timestamp).getTime() / 1000,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close
        }))

        candle.setData(chartData)
        setLoading(false)

        return () => chart.remove()
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [symbol])

  if (loading) return <div>Loading chart...</div>
  if (error) return <div>Error: {error}</div>

  return <div ref={ref}></div>
}
