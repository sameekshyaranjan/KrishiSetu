import { useState, useEffect, useRef } from 'react'

/**
 * High-performance viewport visibility hook for scroll-driven animations.
 * Triggers state changes when elements cross viewport boundaries.
 * 
 * @param {Object} options
 * @param {number} [options.threshold=0.15] - Percentage of target visible to trigger
 * @param {string} [options.rootMargin='0px 0px -60px 0px'] - Offsets trigger before or after entering viewport
 * @param {boolean} [options.once=true] - Only trigger once (disconnects observer for zero overhead)
 * @param {Function} [options.onEnter] - Callback triggered when entering view
 */
export function useInView({
  threshold = 0,
  rootMargin = '0px 0px -10px 0px',
  once = true,
  onEnter = null,
} = {}) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (isInView && once) return

    if (!('IntersectionObserver' in window)) {
      setIsInView(true)
      onEnter?.()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        if (entry.isIntersecting) {
          setIsInView(true)
          onEnter?.()
          if (once) {
            observer.unobserve(entry.target)
          }
        } else if (!once) {
          setIsInView(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(node)

    return () => {
      if (node) observer.unobserve(node)
      observer.disconnect()
    }
  }, [threshold, rootMargin, once, isInView, onEnter])

  return [ref, isInView]
}

export default useInView
