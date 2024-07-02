import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { ReactNode, useEffect, useRef, useState } from 'react'

dayjs.extend(duration)
// dayjs.extend(utc)

interface CooldownTimerProps {
  dateTo: number
  format: string
  fallback?: ReactNode
  trigger?: () => void
}

export default function CooldownTimer({
  dateTo,
  format,
  fallback,
  trigger,
}: CooldownTimerProps) {
  const [diff, setDiff] = useState<number>(Math.max(dateTo - Date.now(), 0))
  const frameId = useRef(0)

  useEffect(() => {
    cancelAnimationFrame(frameId.current)

    const loop = () => {
      const newDiff = Math.max(dateTo - Date.now(), 0)
      setDiff(newDiff)
      if (trigger && newDiff === 0) {
        trigger()
      }
      frameId.current = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(frameId.current)
    }
  }, [dateTo, trigger])

  if (diff === 0) return fallback ?? null

  const timeStr = dayjs.duration(diff).format(format)

  return <span className='tabular-nums'>{timeStr}</span>
}
