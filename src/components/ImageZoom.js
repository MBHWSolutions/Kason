import React from 'react'
import ImageLoader from "$core-components/ImageLoader"
import "./ImageZoom.scss"

const ImageZoom = ({ src, onImageZoomed }) => {
  const wrapper = React.useRef(null)
  const img = src ? src : require(`$assets/images/default.png`)

  const [zoomed, setZoomed] = React.useState(false)
  const [backgroundPosition, setBackgroundPosition] = React.useState('50% 50%')
  const [backgroundSize, setBackgroundSize] = React.useState('50% 50%')
  const [zoomAllowed, setZoomAllowed] = React.useState({ x: false, y: false })

  const checkIfZoomAllowed = () => {
    const { offsetWidth, offsetHeight } = wrapper.current
    if (offsetWidth !== 0 && offsetHeight !== 0) {
      const img = wrapper.current.querySelector('img')
      const { naturalWidth: imgWidth, naturalHeight: imgHeight } = img

      setZoomAllowed({ x: imgWidth > offsetWidth, y: imgHeight > offsetHeight })
    }
  }

  React.useEffect(() => {
    onImageZoomed && onImageZoomed(zoomed)
  }, [zoomed])

  const mouseMoveHandler = (e) => {
    if (!zoomed) {
      return
    }

    const zoom = e.currentTarget
    const { offsetX, offsetY } = e.nativeEvent
    const x = zoomAllowed.x ? offsetX / zoom.offsetWidth * 100 : 50
    const y = zoomAllowed.y ? offsetY / zoom.offsetHeight * 100 : 50
    setBackgroundPosition(`${x}% ${y}%`)
  }

  const triggerZoomed = () => {
    if (zoomAllowed.x || zoomAllowed.y) {
      if (!zoomed) {
        const { naturalHeight, naturalWidth } = wrapper.current.querySelector('img')
        setBackgroundSize(`${naturalWidth}px ${naturalHeight}px`)
      }

      setZoomed(prev => !prev)
    }
  }

  const canBeZoomed = zoomAllowed.x || zoomAllowed.y
  return (
    <div
      onMouseOver={checkIfZoomAllowed}
      onLoad={checkIfZoomAllowed}
      className={`img-zoomed-wrapper${zoomed ? ' cursor-scroll' : ''}${canBeZoomed ? ' zoom' : ''}`}
      ref={wrapper}
      onClick={triggerZoomed}
      onMouseLeave={() => {
        setZoomed(false)
      }}
    >
      <ImageLoader className={`image ${!zoomed ? 'opacity-1' : 'opacity-0'}`} src={img} />
      <div
        onMouseMove={mouseMoveHandler}
        onLoad={mouseMoveHandler.bind(this, { offsetWidth: 0.5, offsetHeight: 0.5 })}
        className={`img-zoomed ${zoomed ? 'opacity-1' : 'opacity-0'}`}
        style={{
          backgroundImage: `url(${img})`,
          backgroundSize,
          backgroundPosition,
          backgroundRepeat: 'no-repeat'
        }}
      />
    </div>
  )
}

export default ImageZoom