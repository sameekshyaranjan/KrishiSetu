import { useState, useEffect } from 'react'
import { useInView } from '@/hooks/useInView'

/**
 * AnimatedCounter component that animates numbers smoothly from 0 to their target value
 * once they enter the viewport.
 * 
 * Supports values like:
 * - "140+" -> counts to 140, displays "140+"
 * - "100%" -> counts to 100, displays "100%"
 * - "0%" -> displays "0%"
 * - "₹91,200" -> counts to 91200, displays "₹91,200"
 * - 31 -> counts to 31
 */
export const AnimatedCounter = ({
  value,
  duration = 1400,
  className = '',
}) => {
  const [ref, inView] = useInView({ threshold: 0.1, once: true })
  const [displayValue, setDisplayValue] = useState('0')

  useEffect(() => {
    if (!inView) return

    // Parse prefix, number, suffix
    const strVal = String(value).trim()
    const prefixMatch = strVal.match(/^[^\d]*/)
    const prefix = prefixMatch ? prefixMatch[0] : ''

    const suffixMatch = strVal.match(/[^\d,.]*$/)
    const suffix = suffixMatch ? suffixMatch[0] : ''

    const cleanNumStr = strVal.slice(prefix.length, strVal.length - (suffix.length || 0)).replace(/,/g, '')
    const targetNum = parseFloat(cleanNumStr)

    if (isNaN(targetNum)) {
      setDisplayValue(strVal)
      return
    }

    if (targetNum === 0) {
      setDisplayValue(strVal)
      return
    }

    const startTime = performance.now()
    const isInteger = !cleanNumStr.includes('.')

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(1, elapsed / duration)
      
      // Ease out expo: 1 - Math.pow(2, -10 * progress)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const currentVal = targetNum * easeProgress

      let formattedNum = isInteger
        ? Math.round(currentVal).toLocaleString('en-IN')
        : currentVal.toFixed(1)

      setDisplayValue(`${prefix}${formattedNum}${suffix}`)

      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      } else {
        setDisplayValue(strVal)
      }
    }

    requestAnimationFrame(updateCounter)
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  )
}

export default AnimatedCounter
