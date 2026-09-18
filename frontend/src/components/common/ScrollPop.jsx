import { useInView } from '@/hooks/useInView'

/**
 * ScrollPop component: As the user scrolls down, individual items pop into view
 * with a crisp, tactile spring/scale entrance.
 * 
 * @param {Object} props
 * @param {number} [props.delay=0] - Delay in milliseconds for staggered item popping
 * @param {number} [props.threshold=0.1] - Viewport intersection threshold
 * @param {string} [props.rootMargin='0px 0px -30px 0px'] - Trigger margin
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ElementType} [props.as='div'] - Element tag
 * @param {React.ReactNode} props.children - Child elements
 */
export const ScrollPop = ({
  children,
  delay = 0,
  threshold = 0.1,
  rootMargin = '0px 0px -30px 0px',
  className = '',
  as: Component = 'div',
  style: customStyle,
  ...props
}) => {
  const [ref, inView] = useInView({ threshold, rootMargin, once: true })

  const transitionStyle = {
    ...(delay ? { transitionDelay: `${delay}ms` } : {}),
    ...customStyle,
  }

  return (
    <Component
      ref={ref}
      style={transitionStyle}
      className={`scroll-pop ${inView ? 'is-popped' : ''} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

export default ScrollPop
