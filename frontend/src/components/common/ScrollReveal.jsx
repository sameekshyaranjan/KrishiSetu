import { useScrollReveal } from '@/hooks/useScrollReveal'

/**
 * ScrollReveal component for subtle, professional viewport-based reveal animations.
 * Provides Apple/Stripe-quality progressive disclosure without excessive motion or layout shifts.
 *
 * @param {Object} props
 * @param {'fade-up'|'fade-in'|'scale'|'scale-up'} [props.variant='fade-up'] - Animation style
 * @param {number} [props.delay=0] - Delay in milliseconds for staggered sequences
 * @param {number} [props.duration=700] - Duration in milliseconds
 * @param {number} [props.threshold=0.15] - Viewport intersection threshold
 * @param {string} [props.rootMargin='0px 0px -80px 0px'] - Observer root margin
 * @param {boolean} [props.once=true] - Only trigger once
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ElementType} [props.as='div'] - Element tag
 * @param {React.ReactNode} props.children - Child elements
 */
export const ScrollReveal = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 700,
  threshold = 0.15,
  rootMargin = '0px 0px -80px 0px',
  once = true,
  className = '',
  as: Component = 'div',
  style: propStyle,
  ...props
}) => {
  const [ref, isRevealed] = useScrollReveal({ threshold, rootMargin, once })

  const transitionStyle = {
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
    ...propStyle
  }

  let variantClass = ''
  if (variant === 'scale' || variant === 'scale-up') {
    variantClass = 'sr-scale'
  } else if (variant === 'fade-in') {
    variantClass = 'sr-fade'
  }

  const stateClass = isRevealed ? 'sr-visible' : ''

  return (
    <Component
      ref={ref}
      style={transitionStyle}
      className={`sr-item ${variantClass} ${stateClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

export default ScrollReveal
