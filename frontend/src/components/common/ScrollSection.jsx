import { useInView } from '@/hooks/useInView'

/**
 * Modern scroll-driven section wrapper that smoothly reveals its children
 * as the user scrolls them into the viewport.
 */
export const ScrollSection = ({
  children,
  variant = 'up', // 'up' | 'scale' | 'left' | 'right'
  delay = 0,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  className = '',
  as: Component = 'div',
  ...props
}) => {
  const [ref, inView] = useInView({ threshold, rootMargin, once: true })

  let baseClass = 'reveal-init'
  let activeClass = 'reveal-active'

  if (variant === 'scale') {
    baseClass = 'reveal-scale-init'
    activeClass = 'reveal-scale-active'
  } else if (variant === 'left') {
    baseClass = 'reveal-slide-left-init'
    activeClass = 'reveal-slide-left-active'
  } else if (variant === 'right') {
    baseClass = 'reveal-slide-right-init'
    activeClass = 'reveal-slide-right-active'
  }

  const style = delay ? { transitionDelay: `${delay}ms` } : undefined

  return (
    <Component
      ref={ref}
      style={style}
      className={`${baseClass} ${inView ? activeClass : ''} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

export default ScrollSection
