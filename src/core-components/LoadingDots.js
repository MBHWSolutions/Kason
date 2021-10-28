import './LoadingDots.scss'

const LoadingDots = ({ className }) => {
  return (
    <div className={`loading-dots ${className}`}>
      <div className='loading-dot'></div>
      <div className='loading-dot'></div>
      <div className='loading-dot'></div>
      <div className='loading-dot'></div>
    </div>
  )
}

export default LoadingDots
