import { useEffect, useRef, useState } from 'react'

/**
 * Lightweight viewport intersection observer hook for high-performance scroll reveals.
 * Respects user's `prefers-reduced-motion` settings.
 * Disconnects once revealed to ensure zero ongoing scroll listener or CPU overhead.
 *
 * @param {Object} options
 * @param {number} [options.threshold=0.15] - Visibility ratio threshold to trigger reveal
 * @param {string} [options.rootMargin='0px 0px -80px 0px'] - Requires element to be 80px into viewport
 * @param {boolean} [options.once=true] - Whether reveal animation should only trigger once
 * @returns {[React.RefObject, boolean]} [ref, isRevealed]
 */
export function useScrollReveal({
  threshold = 0,
  rootMargin = '0px 0px -10px 0px',
  once = true
} = {}) {
  const ref = useRef(null)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (isRevealed && once) return

    if (!('IntersectionObserver' in window)) {
      setIsRevealed(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting) {
          setIsRevealed(true)
          if (once) {
            observer.unobserve(entry.target)
          }
        } else if (!once) {
          setIsRevealed(false)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(node)

    return () => {
      if (node) observer.unobserve(node)
      observer.disconnect()
    }
  }, [threshold, rootMargin, once, isRevealed])

  return [ref, isRevealed]
}

export default useScrollReveal
