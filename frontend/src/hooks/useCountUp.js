import { useState, useEffect, useRef } from 'react'

export function useCountUp(target, duration = 1200, start = 0) {
  const [value, setValue] = useState(start)
  const frameRef = useRef(null)

  useEffect(() => {
    if (target === 0) {
      setValue(0)
      return
    }
    const startTime = performance.now()
    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + (target - start) * eased))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration, start])

  return value
}
